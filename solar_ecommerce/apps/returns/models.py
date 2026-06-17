"""Return Merchandise Authorisation (RMA) models."""
from django.conf import settings
from django.db import models

from apps.base import TimeStampedModel
from apps.orders.models import Order, OrderItem


class ReturnRequest(TimeStampedModel):
    """A customer's request to return one or more items from a delivered order."""

    class Status(models.TextChoices):
        REQUESTED = 'requested', 'Requested'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        IN_TRANSIT = 'in_transit', 'In Transit'
        RECEIVED = 'received', 'Received'
        REFUNDED = 'refunded', 'Refunded'
        COMPLETED = 'completed', 'Completed'

    class Reason(models.TextChoices):
        DAMAGED = 'damaged', 'Damaged on arrival'
        DEFECTIVE = 'defective', 'Defective / not working'
        WRONG_ITEM = 'wrong_item', 'Wrong item delivered'
        NOT_AS_DESCRIBED = 'not_as_described', 'Not as described'
        NO_LONGER_NEEDED = 'no_longer_needed', 'No longer needed'
        OTHER = 'other', 'Other'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
                             related_name='returns')
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='returns')
    rma_number = models.CharField(max_length=30, unique=True, editable=False)
    status = models.CharField(max_length=15, choices=Status.choices,
                              default=Status.REQUESTED, db_index=True)
    reason = models.CharField(max_length=20, choices=Reason.choices)
    description = models.TextField(blank=True, default='')

    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    refund_reference = models.CharField(max_length=100, blank=True, default='')
    admin_notes = models.TextField(blank=True, default='')

    approved_at = models.DateTimeField(null=True, blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta(TimeStampedModel.Meta):
        ordering = ['-created_at']

    def __str__(self):
        return self.rma_number or f'RMA #{self.pk}'

    def save(self, *args, **kwargs):
        if not self.rma_number:
            import uuid as _uuid
            self.rma_number = f'RMA-{_uuid.uuid4().hex[:10].upper()}'
        super().save(*args, **kwargs)


class ReturnItem(TimeStampedModel):
    """Line item inside a return request."""

    return_request = models.ForeignKey(ReturnRequest, on_delete=models.CASCADE,
                                       related_name='items')
    order_item = models.ForeignKey(OrderItem, on_delete=models.PROTECT, related_name='+')
    quantity = models.PositiveIntegerField(default=1)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta(TimeStampedModel.Meta):
        unique_together = ('return_request', 'order_item')

    def __str__(self):
        return f'{self.order_item.product_name} x{self.quantity}'
