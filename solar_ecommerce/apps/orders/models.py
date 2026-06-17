from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from apps.base import TimeStampedModel
from apps.products.models import Product


# ──────────────────────────────────────────────
# Cart
# ──────────────────────────────────────────────

class Cart(TimeStampedModel):
    """One active cart per user."""

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')

    def __str__(self):
        return f'Cart – {self.user.email}'

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def subtotal(self):
        return sum(item.line_total for item in self.items.all())

    @property
    def installation_total(self):
        return sum(
            item.product.installation_fee * item.quantity
            for item in self.items.filter(include_installation=True)
        )

    @property
    def grand_total(self):
        return self.subtotal + self.installation_total


class CartItem(TimeStampedModel):
    """Line item inside a cart."""

    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='+')
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    include_installation = models.BooleanField(default=False)

    class Meta(TimeStampedModel.Meta):
        unique_together = ('cart', 'product')

    def __str__(self):
        return f'{self.product.name} x{self.quantity}'

    @property
    def unit_price(self):
        return self.product.discounted_price

    @property
    def line_total(self):
        return self.unit_price * self.quantity


# ──────────────────────────────────────────────
# Order
# ──────────────────────────────────────────────

class Order(TimeStampedModel):
    """Placed order with lifecycle status."""

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        PROCESSING = 'processing', 'Processing'
        SHIPPED = 'shipped', 'Shipped'
        DELIVERED = 'delivered', 'Delivered'
        CANCELLED = 'cancelled', 'Cancelled'

    class PaymentMethod(models.TextChoices):
        COD = 'cod', 'Cash on Delivery'
        PAYPAL = 'paypal', 'PayPal'
        STRIPE = 'stripe', 'Stripe'
        UPI = 'upi', 'UPI'
        CARD = 'card', 'Credit / Debit Card'
        NETBANKING = 'netbanking', 'Net Banking'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        related_name='orders', null=True, blank=True,
    )
    # Email captured for guest checkouts (when `user` is NULL). Used to
    # send the order confirmation and to look up the order via the
    # guest_access_token sent in that email.
    guest_email = models.EmailField(blank=True, default='')
    # Random token used to authorise guest access to /api/orders/<id>/
    # and the invoice PDF without authentication.
    guest_access_token = models.CharField(max_length=64, blank=True, default='', db_index=True)
    order_number = models.CharField(max_length=30, unique=True, editable=False)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING, db_index=True)
    payment_method = models.CharField(max_length=15, choices=PaymentMethod.choices, default=PaymentMethod.COD)

    # Snapshot of address at order time
    shipping_full_name = models.CharField(max_length=120)
    shipping_phone = models.CharField(max_length=15)
    shipping_address = models.TextField()
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100)
    shipping_postal_code = models.CharField(max_length=20)
    shipping_country = models.CharField(max_length=100, default='India')

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    installation_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Coupon
    coupon_code = models.CharField(max_length=30, blank=True, default='')

    # Payment
    payment_status = models.CharField(
        max_length=15,
        choices=[('unpaid', 'Unpaid'), ('paid', 'Paid'), ('refunded', 'Refunded')],
        default='unpaid', db_index=True,
    )
    payment_id = models.CharField(max_length=100, blank=True, default='', help_text='Gateway txn id')
    paid_at = models.DateTimeField(null=True, blank=True)

    # Fulfilment / tracking
    tracking_number = models.CharField(max_length=100, blank=True, default='')
    tracking_url = models.URLField(blank=True, default='')
    courier_name = models.CharField(max_length=100, blank=True, default='')
    estimated_delivery_date = models.DateField(null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    # Refund metadata
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    refunded_at = models.DateTimeField(null=True, blank=True)
    refund_reference = models.CharField(max_length=100, blank=True, default='')

    # Cancellation
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True, default='')

    note = models.TextField(blank=True, default='')

    class Meta(TimeStampedModel.Meta):
        pass

    def __str__(self):
        return self.order_number

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self._generate_order_number()
        if not self.user_id and not self.guest_access_token:
            import secrets as _secrets
            self.guest_access_token = _secrets.token_urlsafe(32)
        super().save(*args, **kwargs)

    @property
    def customer_email(self) -> str:
        """Email used for notifications, regardless of guest vs registered."""
        if self.user_id:
            return self.user.email
        return self.guest_email

    @staticmethod
    def _generate_order_number():
        import uuid as _uuid
        return f'SOL-{_uuid.uuid4().hex[:10].upper()}'


class OrderItem(TimeStampedModel):
    """Immutable snapshot of products in an order."""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='+')
    product_name = models.CharField(max_length=255)
    sku = models.CharField(max_length=50)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    include_installation = models.BooleanField(default=False)
    installation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta(TimeStampedModel.Meta):
        pass

    def __str__(self):
        return f'{self.product_name} x{self.quantity}'

    @property
    def line_total(self):
        return self.unit_price * self.quantity


class WarrantyDocument(TimeStampedModel):
    """Warranty PDFs attached to order items after delivery."""

    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='warranty_documents')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='warranties/')

    def __str__(self):
        return self.title
