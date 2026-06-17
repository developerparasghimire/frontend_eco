from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from decimal import Decimal

from apps.permissions import IsOwner
from apps.products.models import Product

from .models import Cart, CartItem, Order, WarrantyDocument
from .serializers import (
    AddToCartSerializer,
    CancelOrderSerializer,
    CartSerializer,
    CheckoutQuoteSerializer,
    CheckoutSerializer,
    GuestCheckoutSerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
    RefundSerializer,
    TrackingUpdateSerializer,
    UpdateCartItemSerializer,
    WarrantyDocumentSerializer,
)
from .services import PayPalClient, PayPalError, StripeClient, StripeError
from .services.invoices import render_invoice_pdf
from .tasks import send_refund_email_task


# ──────────────────────────────────────────────
# Cart
# ──────────────────────────────────────────────

class CartView(APIView):
    """GET /api/orders/cart/ – retrieve current user's cart."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.prefetch_related('items__product__images').get_or_create(user=request.user)
        return Response(CartSerializer(cart).data)


class AddToCartView(APIView):
    """POST /api/orders/cart/add/"""
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Lock the product row to prevent oversell race conditions when two
        # concurrent add-to-cart requests arrive for the same product.
        product = (
            Product.objects.select_for_update()
            .filter(pk=data['product'], is_active=True)
            .first()
        )
        if not product:
            return Response({'detail': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product,
            defaults={
                'quantity': data['quantity'],
                'include_installation': data['include_installation'],
            },
        )
        # Compute the resulting total cart quantity for this product and
        # validate it against currently available stock.
        target_quantity = data['quantity'] if created else item.quantity + data['quantity']
        if target_quantity > product.stock:
            available = max(product.stock - (0 if created else item.quantity), 0)
            return Response(
                {'detail': f'Only {available} more in stock.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not created:
            item.quantity = target_quantity
            item.include_installation = data['include_installation']
            item.save(update_fields=['quantity', 'include_installation'])

        cart.refresh_from_db()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class UpdateCartItemView(APIView):
    """PATCH/DELETE /api/orders/cart/items/<item_id>/"""
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        item = CartItem.objects.filter(pk=item_id, cart__user=request.user).first()
        if not item:
            return Response({'detail': 'Item not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        item.quantity = data['quantity']
        if 'include_installation' in data:
            item.include_installation = data['include_installation']
        item.save()

        cart = item.cart
        cart.refresh_from_db()
        return Response(CartSerializer(cart).data)

    def delete(self, request, item_id):
        deleted, _ = CartItem.objects.filter(pk=item_id, cart__user=request.user).delete()
        if not deleted:
            return Response({'detail': 'Item not found.'}, status=status.HTTP_404_NOT_FOUND)
        cart = Cart.objects.get(user=request.user)
        return Response(CartSerializer(cart).data)


class ClearCartView(APIView):
    """DELETE /api/orders/cart/clear/ – remove all items from cart."""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        cart = Cart.objects.filter(user=request.user).first()
        if cart:
            cart.items.all().delete()
            return Response(CartSerializer(cart).data)
        return Response({'detail': 'Cart is empty.'})


# ──────────────────────────────────────────────
# Checkout
# ──────────────────────────────────────────────

class CheckoutView(APIView):
    """POST /api/orders/checkout/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class GuestCheckoutView(APIView):
    """POST /api/orders/checkout/guest/

    Creates an order for unauthenticated guests. Guests supply their full cart
    inline. A guest_access_token is returned for order tracking and is also
    emailed to the guest for future reference.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GuestCheckoutSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            {
                'id': str(order.id),
                'order_number': order.order_number,
                'guest_access_token': order.guest_access_token,
                'grand_total': str(order.grand_total),
                'payment_method': order.payment_method,
            },
            status=status.HTTP_201_CREATED,
        )


class GuestOrderDetailView(APIView):
    """GET /api/orders/guest/<order_number>/?token=<guest_access_token>

    Token-authenticated detail endpoint for guest orders. Used by the
    confirmation page and to render invoice download links.
    """
    permission_classes = [AllowAny]

    def get(self, request, order_number):
        token = request.query_params.get('token', '')
        if not token:
            return Response({'detail': 'Missing token.'}, status=status.HTTP_400_BAD_REQUEST)
        order = Order.objects.filter(
            order_number=order_number, guest_access_token=token,
        ).first()
        if not order:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(OrderSerializer(order).data)


class OrderInvoicePDFView(APIView):
    """GET /api/orders/<order_number>/invoice.pdf[?token=...]

    Returns the order invoice as a PDF.

    Access:
      • Authenticated owner of the order (or admin)
      • Guest order: must pass the guest_access_token via ?token=
    """
    permission_classes = [AllowAny]

    def get(self, request, order_number):
        from django.http import HttpResponse

        token = request.query_params.get('token', '')

        # Reject completely unauthenticated requests before any DB lookup to
        # prevent order-number enumeration via 404 vs 401 timing oracle.
        if not token and not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'},
                            status=status.HTTP_401_UNAUTHORIZED)

        order = Order.objects.filter(order_number=order_number).first()
        if not order:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Authorisation
        if order.user_id is None:
            if not token or token != order.guest_access_token:
                return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        else:
            if not request.user.is_authenticated:
                return Response({'detail': 'Authentication required.'},
                                status=status.HTTP_401_UNAUTHORIZED)
            if not request.user.is_staff and order.user_id != request.user.id:
                return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

        pdf = render_invoice_pdf(order)
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = (
            f'attachment; filename="invoice-{order.order_number}.pdf"'
        )
        return response


# ──────────────────────────────────────────────
# Orders
# ──────────────────────────────────────────────

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/orders/             – list own orders (or all for admin)
    GET /api/orders/<id>/        – order detail
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Order.objects.prefetch_related('items')
        if self.request.user.is_staff:
            return qs  # Admin sees all orders
        return qs.filter(user=self.request.user)

    def get_permissions(self):
        if self.action == 'update_status':
            return [IsAdminUser()]
        return super().get_permissions()

    def check_object_permissions(self, request, obj):
        """Non-admin users can only access their own orders."""
        super().check_object_permissions(request, obj)
        if not request.user.is_staff and obj.user != request.user:
            self.permission_denied(request, message='You do not have permission to access this order.')

    @action(detail=True, methods=['post'], url_path='update-status',
            permission_classes=[IsAdminUser])
    def update_status(self, request, pk=None):
        """POST /api/orders/<id>/update-status/ (admin only)"""
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']

        # Validate status transitions
        valid_transitions = {
            Order.Status.PENDING: [Order.Status.CONFIRMED, Order.Status.CANCELLED],
            Order.Status.CONFIRMED: [Order.Status.PROCESSING, Order.Status.CANCELLED],
            Order.Status.PROCESSING: [Order.Status.SHIPPED, Order.Status.CANCELLED],
            Order.Status.SHIPPED: [Order.Status.DELIVERED],
            Order.Status.DELIVERED: [],
            Order.Status.CANCELLED: [],
        }
        allowed = valid_transitions.get(order.status, [])
        if new_status not in allowed:
            return Response(
                {'detail': f'Cannot transition from "{order.status}" to "{new_status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = new_status
        if new_status == Order.Status.CANCELLED:
            order.cancelled_at = timezone.now()
        order.save(update_fields=['status', 'cancelled_at'] if new_status == Order.Status.CANCELLED else ['status'])
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        """POST /api/orders/<id>/cancel/ – user cancels pending order."""
        order = self.get_object()

        # Non-admin can only cancel their own orders
        if not request.user.is_staff and order.user != request.user:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)

        if order.status != Order.Status.PENDING:
            return Response(
                {'detail': 'Only pending orders can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CancelOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            # Restore stock atomically
            for item in order.items.select_related('product'):
                Product.objects.filter(pk=item.product_id).update(
                    stock=F('stock') + item.quantity,
                )

            order.status = Order.Status.CANCELLED
            order.cancelled_at = timezone.now()
            order.cancellation_reason = serializer.validated_data.get('reason', '')
            order.save(update_fields=['status', 'cancelled_at', 'cancellation_reason'])

        return Response(OrderSerializer(order).data)

    # ── Payments ───────────────────────────────

    @action(detail=True, methods=['post'], url_path='payments/paypal/create')
    def paypal_create(self, request, pk=None):
        """
        POST /api/orders/list/<id>/payments/paypal/create/

        Creates a PayPal order for an unpaid local order. Returns the
        PayPal order id for the frontend SDK / approval redirect.
        """
        order = self.get_object()
        if order.user_id != request.user.id and not request.user.is_staff:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        if order.payment_status == 'paid':
            return Response({'detail': 'Order is already paid.'}, status=status.HTTP_400_BAD_REQUEST)
        if order.payment_method != Order.PaymentMethod.PAYPAL:
            return Response(
                {'detail': 'This order is not configured for PayPal.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            data = PayPalClient().create_order(order)
        except PayPalError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        # Persist the PayPal order id so we can verify on capture
        order.payment_id = data.get('id', '')
        order.save(update_fields=['payment_id'])

        return Response({
            'paypal_order_id': data.get('id'),
            'status': data.get('status'),
            'links': data.get('links', []),
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='payments/paypal/capture')
    def paypal_capture(self, request, pk=None):
        """POST /api/orders/list/<id>/payments/paypal/capture/"""
        order = self.get_object()
        if order.user_id != request.user.id and not request.user.is_staff:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        if order.payment_status == 'paid':
            return Response({'detail': 'Order is already paid.'}, status=status.HTTP_400_BAD_REQUEST)

        paypal_order_id = (
            request.data.get('paypal_order_id') or order.payment_id
        )
        if not paypal_order_id:
            return Response(
                {'detail': 'paypal_order_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            data = PayPalClient().capture_order(paypal_order_id)
        except PayPalError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        if data.get('status') != 'COMPLETED':
            return Response(
                {'detail': 'PayPal capture not completed.', 'paypal': data},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            order.payment_status = 'paid'
            order.payment_id = paypal_order_id
            order.paid_at = timezone.now()
            update_fields = ['payment_status', 'payment_id', 'paid_at']
            if order.status == Order.Status.PENDING:
                order.status = Order.Status.CONFIRMED
                update_fields.append('status')
            order.save(update_fields=update_fields)

        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], url_path='payments/cod/mark-paid',
            permission_classes=[IsAdminUser])
    def cod_mark_paid(self, request, pk=None):
        """
        POST /api/orders/list/<id>/payments/cod/mark-paid/  (admin)

        Marks a COD order as paid (e.g., after delivery + cash collected).
        """
        order = self.get_object()
        if order.payment_method != Order.PaymentMethod.COD:
            return Response(
                {'detail': 'Only COD orders can be marked paid via this endpoint.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if order.payment_status == 'paid':
            return Response({'detail': 'Order is already paid.'}, status=status.HTTP_400_BAD_REQUEST)

        order.payment_status = 'paid'
        order.paid_at = timezone.now()
        order.save(update_fields=['payment_status', 'paid_at'])
        return Response(OrderSerializer(order).data)

    # ── Stripe ────────────────────────────────

    @action(detail=True, methods=['post'], url_path='payments/stripe/create')
    def stripe_create(self, request, pk=None):
        """POST /api/orders/list/<id>/payments/stripe/create/

        Creates a Stripe PaymentIntent and returns the client_secret for
        Stripe Elements / PaymentElement on the frontend.
        """
        order = self.get_object()
        if order.user_id != request.user.id and not request.user.is_staff:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        if order.payment_status == 'paid':
            return Response({'detail': 'Order is already paid.'}, status=status.HTTP_400_BAD_REQUEST)
        if order.payment_method not in (Order.PaymentMethod.STRIPE, Order.PaymentMethod.CARD):
            return Response(
                {'detail': 'This order is not configured for Stripe.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            intent = StripeClient().create_payment_intent(order)
        except StripeError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        order.payment_id = intent['id']
        order.save(update_fields=['payment_id'])

        from django.conf import settings as _settings
        return Response({
            'client_secret': intent['client_secret'],
            'payment_intent_id': intent['id'],
            'publishable_key': _settings.STRIPE_PUBLISHABLE_KEY,
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='payments/stripe/confirm')
    def stripe_confirm(self, request, pk=None):
        """POST /api/orders/list/<id>/payments/stripe/confirm/

        Polled after Stripe.js confirms a PaymentIntent. Verifies status
        with Stripe and marks the order paid. Webhook does the same job
        out-of-band; this endpoint just gives the user immediate feedback.
        """
        order = self.get_object()
        if order.user_id != request.user.id and not request.user.is_staff:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        if not order.payment_id:
            return Response({'detail': 'No PaymentIntent associated.'},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            intent = StripeClient().retrieve_payment_intent(order.payment_id)
        except StripeError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        if intent['status'] != 'succeeded':
            return Response(
                {'detail': f'Payment not completed (status={intent["status"]}).'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if order.payment_status != 'paid':
            with transaction.atomic():
                order.payment_status = 'paid'
                order.paid_at = timezone.now()
                update_fields = ['payment_status', 'paid_at']
                if order.status == Order.Status.PENDING:
                    order.status = Order.Status.CONFIRMED
                    update_fields.append('status')
                order.save(update_fields=update_fields)
        return Response(OrderSerializer(order).data)

    # ── Tracking ──────────────────────────────

    @action(detail=True, methods=['post'], url_path='tracking',
            permission_classes=[IsAdminUser])
    def set_tracking(self, request, pk=None):
        """POST /api/orders/list/<id>/tracking/  (admin)

        Sets tracking info and (if eligible) transitions the order to SHIPPED.
        """
        order = self.get_object()
        serializer = TrackingUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        order.tracking_number = data['tracking_number']
        order.courier_name = data.get('courier_name', '') or order.courier_name
        order.tracking_url = data.get('tracking_url', '') or order.tracking_url
        if data.get('estimated_delivery_date'):
            order.estimated_delivery_date = data['estimated_delivery_date']

        update_fields = [
            'tracking_number', 'courier_name', 'tracking_url',
            'estimated_delivery_date',
        ]
        if order.status in (Order.Status.CONFIRMED, Order.Status.PROCESSING):
            order.status = Order.Status.SHIPPED
            order.shipped_at = timezone.now()
            update_fields += ['status', 'shipped_at']
        order.save(update_fields=update_fields)
        return Response(OrderSerializer(order).data)

    # ── Refunds ───────────────────────────────

    @action(detail=True, methods=['post'], url_path='refund',
            permission_classes=[IsAdminUser])
    def refund(self, request, pk=None):
        """POST /api/orders/list/<id>/refund/  (admin)

        Issues a refund through the original payment processor and records it
        on the order. For COD orders, marks as refunded without a gateway call.
        Uses select_for_update to prevent concurrent double-refunds.
        """
        serializer = RefundSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            try:
                order = Order.objects.select_for_update().get(pk=pk)
            except Order.DoesNotExist:
                return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

            if order.payment_status == 'refunded':
                return Response({'detail': 'Order has already been refunded.'},
                                status=status.HTTP_400_BAD_REQUEST)
            if order.payment_status != 'paid':
                return Response(
                    {'detail': 'Only paid orders can be refunded.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            amount = serializer.validated_data.get('amount') or order.grand_total
            reason = serializer.validated_data.get('reason')

            reference = ''
            try:
                if order.payment_method == Order.PaymentMethod.PAYPAL:
                    client = PayPalClient()
                    capture_id = client.get_capture_id(order.payment_id)
                    if not capture_id:
                        return Response(
                            {'detail': 'No PayPal capture found for this order.'},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    refund_data = client.refund_capture(
                        capture_id, amount=amount,
                        note=serializer.validated_data.get('note', ''),
                    )
                    reference = refund_data.get('id', '')
                elif order.payment_method in (Order.PaymentMethod.STRIPE, Order.PaymentMethod.CARD):
                    refund_data = StripeClient().create_refund(
                        order.payment_id, amount=amount, reason=reason,
                    )
                    reference = refund_data.get('id', '')
                # else: COD or other — no gateway call, just bookkeeping below.
            except (PayPalError, StripeError) as exc:
                return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

            order.payment_status = 'refunded'
            order.refund_amount = amount
            order.refunded_at = timezone.now()
            order.refund_reference = reference
            order.save(update_fields=[
                'payment_status', 'refund_amount', 'refunded_at', 'refund_reference',
            ])

        send_refund_email_task.delay(str(order.pk), str(amount), reference)
        return Response(OrderSerializer(order).data)


# ──────────────────────────────────────────────
# Checkout quote (tax + shipping live preview)
# ──────────────────────────────────────────────

class CheckoutQuoteView(APIView):
    """POST /api/orders/checkout/quote/ – returns a price breakdown for a cart."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CheckoutQuoteSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.to_representation(serializer.validated_data))


# ──────────────────────────────────────────────
# Webhooks (no auth — verified by signature)
# ──────────────────────────────────────────────

import logging  # noqa: E402
from django.views.decorators.csrf import csrf_exempt  # noqa: E402
from django.utils.decorators import method_decorator  # noqa: E402
from rest_framework.permissions import AllowAny  # noqa: E402

_webhook_logger = logging.getLogger(__name__)


def _resolve_order_paid(order_id, payment_id, gateway: str):
    try:
        order = Order.objects.get(pk=order_id)
    except (Order.DoesNotExist, ValueError):
        _webhook_logger.warning('%s webhook: order %s not found', gateway, order_id)
        return None
    if order.payment_status == 'paid':
        return order
    with transaction.atomic():
        order.payment_status = 'paid'
        order.payment_id = payment_id or order.payment_id
        order.paid_at = timezone.now()
        update_fields = ['payment_status', 'payment_id', 'paid_at']
        if order.status == Order.Status.PENDING:
            order.status = Order.Status.CONFIRMED
            update_fields.append('status')
        order.save(update_fields=update_fields)
    return order


def _resolve_order_refunded(order_id, reference: str, amount=None):
    try:
        order = Order.objects.get(pk=order_id)
    except (Order.DoesNotExist, ValueError):
        return None
    if order.payment_status == 'refunded':
        return order
    with transaction.atomic():
        order.payment_status = 'refunded'
        order.refunded_at = timezone.now()
        order.refund_reference = reference or order.refund_reference
        update_fields = ['payment_status', 'refunded_at', 'refund_reference']
        if amount is not None:
            order.refund_amount = amount
            update_fields.append('refund_amount')
        order.save(update_fields=update_fields)
    return order


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    """POST /api/webhooks/stripe/ – Stripe-Signature verified."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        signature = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        try:
            event = StripeClient().construct_webhook_event(request.body, signature)
        except StripeError as exc:
            _webhook_logger.warning('Stripe webhook rejected: %s', exc)
            return Response({'detail': 'Invalid signature.'}, status=status.HTTP_400_BAD_REQUEST)

        event_type = event.get('type', '')
        data_object = (event.get('data') or {}).get('object') or {}
        metadata = data_object.get('metadata') or {}
        order_id = metadata.get('order_id')

        if event_type == 'payment_intent.succeeded' and order_id:
            _resolve_order_paid(order_id, data_object.get('id', ''), 'Stripe')
        elif event_type in ('charge.refunded', 'payment_intent.refunded') and order_id:
            amount_refunded = data_object.get('amount_refunded')
            amount = (Decimal(amount_refunded) / Decimal('100')) if amount_refunded else None
            _resolve_order_refunded(order_id, data_object.get('id', ''), amount)

        return Response({'received': True})


@method_decorator(csrf_exempt, name='dispatch')
class PayPalWebhookView(APIView):
    """POST /api/webhooks/paypal/ – verified via PayPal verify-webhook-signature."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        from django.conf import settings as _settings
        webhook_id = getattr(_settings, 'PAYPAL_WEBHOOK_ID', '')
        if not webhook_id:
            _webhook_logger.error('PayPal webhook received but PAYPAL_WEBHOOK_ID not set.')
            return Response({'detail': 'Webhook not configured.'},
                            status=status.HTTP_503_SERVICE_UNAVAILABLE)

        client = PayPalClient()
        try:
            ok = client.verify_webhook(headers=request.headers, body=request.body,
                                       webhook_id=webhook_id)
        except PayPalError as exc:
            _webhook_logger.warning('PayPal webhook verify error: %s', exc)
            return Response({'detail': 'Verification failed.'},
                            status=status.HTTP_400_BAD_REQUEST)
        if not ok:
            return Response({'detail': 'Invalid signature.'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            payload = request.data
        except Exception:
            payload = {}
        event_type = payload.get('event_type', '')
        resource = payload.get('resource') or {}

        # PayPal capture id -> order via stored payment_id (paypal_order_id)
        if event_type == 'PAYMENT.CAPTURE.COMPLETED':
            supplementary = (
                resource.get('supplementary_data', {})
                .get('related_ids', {})
            )
            paypal_order_id = supplementary.get('order_id', '')
            order = Order.objects.filter(payment_id=paypal_order_id).first() if paypal_order_id else None
            if order:
                _resolve_order_paid(order.pk, paypal_order_id, 'PayPal')
        elif event_type == 'PAYMENT.CAPTURE.REFUNDED':
            links = resource.get('links') or []
            up_order = next((l for l in links if l.get('rel') == 'up'), None)
            paypal_order_id = ''
            if up_order:
                # href contains the capture id; we just record the refund id.
                paypal_order_id = up_order.get('href', '').rstrip('/').split('/')[-1]
            order = Order.objects.filter(payment_id=paypal_order_id).first() if paypal_order_id else None
            if order:
                amt = resource.get('amount', {}).get('value')
                _resolve_order_refunded(
                    order.pk, resource.get('id', ''),
                    Decimal(amt) if amt else None,
                )

        return Response({'received': True})


# ──────────────────────────────────────────────
# Warranty Documents
# ──────────────────────────────────────────────

class WarrantyDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/orders/warranties/ – user's warranty docs."""
    serializer_class = WarrantyDocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WarrantyDocument.objects.filter(
            order_item__order__user=self.request.user,
        ).select_related('order_item')
