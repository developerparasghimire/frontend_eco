from rest_framework import serializers
from django.conf import settings
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from decimal import Decimal

from apps.products.serializers import ProductListSerializer
from apps.products.models import Product
from apps.users.models import Address
from apps.coupons.models import Coupon, CouponUsage
from apps.shipping.models import quote_for_address
from .models import Cart, CartItem, Order, OrderItem, WarrantyDocument


# ──────────────────────────────────────────────
# Cart
# ──────────────────────────────────────────────

class CartItemSerializer(serializers.ModelSerializer):
    product_detail = ProductListSerializer(source='product', read_only=True)
    unit_price = serializers.ReadOnlyField()
    line_total = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_detail', 'quantity',
                  'include_installation', 'unit_price', 'line_total')
        read_only_fields = ('id',)


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    subtotal = serializers.ReadOnlyField()
    installation_total = serializers.ReadOnlyField()
    grand_total = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ('id', 'items', 'total_items', 'subtotal',
                  'installation_total', 'grand_total', 'updated_at')
        read_only_fields = ('id', 'updated_at')


class AddToCartSerializer(serializers.Serializer):
    product = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    include_installation = serializers.BooleanField(default=False)


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)
    include_installation = serializers.BooleanField(required=False)


# ──────────────────────────────────────────────
# Order
# ──────────────────────────────────────────────

class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'sku', 'unit_price',
                  'quantity', 'include_installation', 'installation_fee', 'line_total')
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_email = serializers.ReadOnlyField()

    class Meta:
        model = Order
        fields = (
            'id', 'order_number', 'status', 'payment_method',
            'guest_email', 'customer_email',
            'shipping_full_name', 'shipping_phone', 'shipping_address',
            'shipping_city', 'shipping_state', 'shipping_postal_code', 'shipping_country',
            'subtotal', 'installation_total', 'discount_amount', 'coupon_code',
            'tax_rate', 'tax_amount', 'shipping_cost', 'grand_total',
            'payment_status', 'payment_id', 'paid_at',
            'tracking_number', 'tracking_url', 'courier_name',
            'estimated_delivery_date', 'shipped_at', 'delivered_at',
            'refund_amount', 'refunded_at', 'refund_reference',
            'cancelled_at', 'cancellation_reason',
            'note', 'items', 'created_at', 'updated_at',
        )
        read_only_fields = (
            'id', 'order_number', 'status',
            'guest_email', 'customer_email',
            'subtotal', 'installation_total', 'discount_amount', 'coupon_code',
            'tax_rate', 'tax_amount', 'shipping_cost', 'grand_total',
            'payment_status', 'payment_id', 'paid_at',
            'tracking_number', 'tracking_url', 'courier_name',
            'estimated_delivery_date', 'shipped_at', 'delivered_at',
            'refund_amount', 'refunded_at', 'refund_reference',
            'cancelled_at', 'cancellation_reason',
            'created_at', 'updated_at',
        )


class CheckoutSerializer(serializers.Serializer):
    """Validates checkout payload and creates the order atomically."""

    address_id = serializers.UUIDField()
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices)
    coupon_code = serializers.CharField(required=False, default='', allow_blank=True)
    note = serializers.CharField(required=False, default='', allow_blank=True)

    def validate_address_id(self, value):
        user = self.context['request'].user
        try:
            return Address.objects.get(pk=value, user=user)
        except Address.DoesNotExist:
            raise serializers.ValidationError('Address not found.')

    def _resolve_coupon(self, code, user):
        """Validate coupon if provided. Returns (Coupon, None) or (None, error_msg)."""
        if not code:
            return None, None
        try:
            coupon = Coupon.objects.get(code__iexact=code.strip())
        except Coupon.DoesNotExist:
            return None, 'Coupon not found.'
        if not coupon.is_valid:
            return None, 'This coupon is expired or inactive.'
        usage = CouponUsage.objects.filter(coupon=coupon, user=user).count()
        if usage >= coupon.per_user_limit:
            return None, 'You have already used this coupon.'
        return coupon, None

    @transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user
        address = validated_data['address_id']  # resolved in validate
        cart = Cart.objects.prefetch_related('items__product').get(user=user)

        if not cart.items.exists():
            raise serializers.ValidationError({'cart': 'Cart is empty.'})

        # Check stock
        for ci in cart.items.all():
            if ci.quantity > ci.product.stock:
                raise serializers.ValidationError(
                    {'stock': f'"{ci.product.name}" only has {ci.product.stock} in stock.'}
                )

        # Resolve coupon
        coupon, coupon_err = self._resolve_coupon(
            validated_data.get('coupon_code', ''), user,
        )
        if coupon_err:
            raise serializers.ValidationError({'coupon_code': coupon_err})

        subtotal = cart.subtotal
        installation_total = cart.installation_total
        discount_amount = coupon.calculate_discount(subtotal) if coupon else Decimal('0')

        # ── Shipping quote ────────────────────────────────────────────────
        ship_quote = quote_for_address(
            state=address.state,
            country=address.country,
            subtotal=subtotal,
        )
        shipping_cost = Decimal(ship_quote['cost'])

        # ── Tax (applied to taxable base, after discount, before shipping) ─
        tax_rate = Decimal(getattr(settings, 'TAX_RATE_PERCENT', 0))
        taxable_base = max(Decimal('0'), subtotal + installation_total - discount_amount)
        tax_amount = (taxable_base * tax_rate / Decimal('100')).quantize(Decimal('0.01'))

        grand_total = (
            subtotal + installation_total - discount_amount + tax_amount + shipping_cost
        )
        if grand_total < 0:
            grand_total = Decimal('0')

        order = Order.objects.create(
            user=user,
            payment_method=validated_data['payment_method'],
            note=validated_data.get('note', ''),
            coupon_code=coupon.code if coupon else '',
            shipping_full_name=address.full_name,
            shipping_phone=address.phone,
            shipping_address=f'{address.address_line1}\n{address.address_line2}'.strip(),
            shipping_city=address.city,
            shipping_state=address.state,
            shipping_postal_code=address.postal_code,
            shipping_country=address.country,
            subtotal=subtotal,
            installation_total=installation_total,
            discount_amount=discount_amount,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            shipping_cost=shipping_cost,
            grand_total=grand_total,
        )

        order_items = []
        for ci in cart.items.select_related('product'):
            order_items.append(OrderItem(
                order=order,
                product=ci.product,
                product_name=ci.product.name,
                sku=ci.product.sku,
                unit_price=ci.product.discounted_price,
                quantity=ci.quantity,
                include_installation=ci.include_installation,
                installation_fee=ci.product.installation_fee if ci.include_installation else 0,
            ))
            # Atomic stock decrement – prevents race conditions
            Product.objects.filter(pk=ci.product.pk).update(
                stock=F('stock') - ci.quantity,
            )

        OrderItem.objects.bulk_create(order_items)

        # Record coupon usage atomically
        if coupon:
            CouponUsage.objects.create(coupon=coupon, user=user, order=order)
            Coupon.objects.filter(pk=coupon.pk).update(
                used_count=F('used_count') + 1,
            )

        cart.items.all().delete()
        return order


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.Status.choices)


class TrackingUpdateSerializer(serializers.Serializer):
    """Admin sets shipment tracking info; transitions order to SHIPPED."""
    tracking_number = serializers.CharField(max_length=100)
    courier_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    tracking_url = serializers.URLField(required=False, allow_blank=True)
    estimated_delivery_date = serializers.DateField(required=False, allow_null=True)


class RefundSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, min_value=0)
    reason = serializers.ChoiceField(
        choices=['duplicate', 'fraudulent', 'requested_by_customer'],
        required=False,
        default='requested_by_customer',
    )
    note = serializers.CharField(required=False, allow_blank=True, max_length=500)


class CheckoutQuoteSerializer(serializers.Serializer):
    """
    Stateless quote: given an address (and optional coupon), returns the
    breakdown the frontend needs to render before checkout submission.
    """
    address_id = serializers.UUIDField()
    coupon_code = serializers.CharField(required=False, allow_blank=True)

    def validate_address_id(self, value):
        user = self.context['request'].user
        try:
            return Address.objects.get(pk=value, user=user)
        except Address.DoesNotExist:
            raise serializers.ValidationError('Address not found.')

    def to_representation(self, instance):
        request = self.context['request']
        user = request.user
        address: Address = instance['address_id']
        cart = (
            Cart.objects.prefetch_related('items__product')
            .filter(user=user).first()
        )
        if not cart or not cart.items.exists():
            return {'detail': 'Cart is empty.'}

        subtotal = Decimal(cart.subtotal)
        installation_total = Decimal(cart.installation_total)
        discount = Decimal('0')
        coupon_code = (instance.get('coupon_code') or '').strip()
        if coupon_code:
            coupon = Coupon.objects.filter(code__iexact=coupon_code).first()
            if coupon and coupon.is_valid:
                discount = Decimal(coupon.calculate_discount(subtotal))

        ship = quote_for_address(
            state=address.state, country=address.country, subtotal=subtotal,
        )
        shipping_cost = Decimal(ship['cost'])
        tax_rate = Decimal(getattr(settings, 'TAX_RATE_PERCENT', 0))
        taxable = max(Decimal('0'), subtotal + installation_total - discount)
        tax_amount = (taxable * tax_rate / Decimal('100')).quantize(Decimal('0.01'))
        grand = subtotal + installation_total - discount + tax_amount + shipping_cost

        return {
            'subtotal': str(subtotal),
            'installation_total': str(installation_total),
            'discount_amount': str(discount),
            'tax_rate': str(tax_rate),
            'tax_amount': str(tax_amount),
            'shipping_cost': str(shipping_cost),
            'shipping_zone': ship['zone'],
            'shipping_eta_min': ship['eta_min'],
            'shipping_eta_max': ship['eta_max'],
            'grand_total': str(max(Decimal('0'), grand)),
            'currency': 'INR',
        }


class CancelOrderSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, default='', allow_blank=True, max_length=500)


# ──────────────────────────────────────────────
# Guest checkout
# ──────────────────────────────────────────────

class GuestCheckoutItemSerializer(serializers.Serializer):
    """One line in a guest's cart payload."""
    product = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)
    include_installation = serializers.BooleanField(default=False)


class GuestCheckoutSerializer(serializers.Serializer):
    """
    Validates a guest checkout payload and creates the Order atomically.

    Guests don't have a persisted Cart on the server — they POST the entire
    cart inline along with their shipping details and email.
    """
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=120)
    phone = serializers.CharField(max_length=15)
    address_line1 = serializers.CharField(max_length=255)
    address_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True, default='')
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    postal_code = serializers.CharField(max_length=20)
    country = serializers.CharField(max_length=100, default='India')

    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices)
    coupon_code = serializers.CharField(required=False, default='', allow_blank=True)
    note = serializers.CharField(required=False, default='', allow_blank=True)
    items = GuestCheckoutItemSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('Cart is empty.')
        return value

    @transaction.atomic
    def create(self, validated_data):
        items_payload = validated_data['items']

        # Lock all referenced product rows to validate stock atomically.
        product_ids = [it['product'] for it in items_payload]
        products = {
            p.pk: p for p in Product.objects
            .select_for_update()
            .filter(pk__in=product_ids, is_active=True)
        }
        if len(products) != len(set(product_ids)):
            raise serializers.ValidationError({'items': 'One or more products are unavailable.'})

        subtotal = Decimal('0')
        installation_total = Decimal('0')
        order_items_data = []
        for it in items_payload:
            product = products[it['product']]
            if it['quantity'] > product.stock:
                raise serializers.ValidationError(
                    {'stock': f'"{product.name}" only has {product.stock} in stock.'}
                )
            unit = Decimal(product.discounted_price)
            line_total = unit * it['quantity']
            subtotal += line_total
            install_fee = Decimal(product.installation_fee) if it['include_installation'] else Decimal('0')
            installation_total += install_fee * it['quantity']
            order_items_data.append({
                'product': product, 'unit_price': unit,
                'quantity': it['quantity'],
                'include_installation': it['include_installation'],
                'installation_fee': install_fee,
            })

        coupon = None
        coupon_code_in = (validated_data.get('coupon_code') or '').strip()
        if coupon_code_in:
            coupon = Coupon.objects.filter(code__iexact=coupon_code_in).first()
            if not coupon or not coupon.is_valid:
                raise serializers.ValidationError({'coupon_code': 'Invalid or expired coupon.'})
            # Enforce per-user limit for guests using their email as identity.
            if coupon.per_user_limit > 0:
                prior_uses = Order.objects.filter(
                    guest_email__iexact=validated_data['email'],
                    coupon_code__iexact=coupon.code,
                ).count()
                if prior_uses >= coupon.per_user_limit:
                    raise serializers.ValidationError(
                        {'coupon_code': 'You have already used this coupon the maximum number of times.'}
                    )
        discount_amount = coupon.calculate_discount(subtotal) if coupon else Decimal('0')

        ship = quote_for_address(
            state=validated_data['state'],
            country=validated_data['country'],
            subtotal=subtotal,
        )
        shipping_cost = Decimal(ship['cost'])
        tax_rate = Decimal(getattr(settings, 'TAX_RATE_PERCENT', 0))
        taxable_base = max(Decimal('0'), subtotal + installation_total - discount_amount)
        tax_amount = (taxable_base * tax_rate / Decimal('100')).quantize(Decimal('0.01'))
        grand_total = max(
            Decimal('0'),
            subtotal + installation_total - discount_amount + tax_amount + shipping_cost,
        )

        addr2 = validated_data.get('address_line2', '') or ''
        order = Order.objects.create(
            user=None,
            guest_email=validated_data['email'],
            payment_method=validated_data['payment_method'],
            note=validated_data.get('note', ''),
            coupon_code=coupon.code if coupon else '',
            shipping_full_name=validated_data['full_name'],
            shipping_phone=validated_data['phone'],
            shipping_address=f"{validated_data['address_line1']}\n{addr2}".strip(),
            shipping_city=validated_data['city'],
            shipping_state=validated_data['state'],
            shipping_postal_code=validated_data['postal_code'],
            shipping_country=validated_data['country'],
            subtotal=subtotal,
            installation_total=installation_total,
            discount_amount=discount_amount,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            shipping_cost=shipping_cost,
            grand_total=grand_total,
        )

        order_items = []
        for d in order_items_data:
            order_items.append(OrderItem(
                order=order,
                product=d['product'],
                product_name=d['product'].name,
                sku=d['product'].sku,
                unit_price=d['unit_price'],
                quantity=d['quantity'],
                include_installation=d['include_installation'],
                installation_fee=d['installation_fee'],
            ))
            Product.objects.filter(pk=d['product'].pk).update(
                stock=F('stock') - d['quantity'],
            )
        OrderItem.objects.bulk_create(order_items)

        if coupon:
            Coupon.objects.filter(pk=coupon.pk).update(
                used_count=F('used_count') + 1,
            )
        return order


class WarrantyDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = WarrantyDocument
        fields = ('id', 'order_item', 'title', 'file', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate_file(self, value):
        """Validate warranty document file type and size."""
        max_size = getattr(settings, 'MAX_DOCUMENT_UPLOAD_SIZE', 10 * 1024 * 1024)
        allowed_types = getattr(settings, 'ALLOWED_DOCUMENT_TYPES', ['application/pdf'])

        if value.size > max_size:
            raise serializers.ValidationError(f'File size cannot exceed {max_size // (1024 * 1024)} MB.')
        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                f'Unsupported file type "{value.content_type}". Only PDF is allowed.'
            )
        return value
