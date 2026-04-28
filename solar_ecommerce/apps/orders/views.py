from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import F
from django.utils import timezone

from apps.permissions import IsOwner
from apps.products.models import Product

from .models import Cart, CartItem, Order, WarrantyDocument
from .serializers import (
    AddToCartSerializer,
    CancelOrderSerializer,
    CartSerializer,
    CheckoutSerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
    UpdateCartItemSerializer,
    WarrantyDocumentSerializer,
)
from .services import PayPalClient, PayPalError


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
