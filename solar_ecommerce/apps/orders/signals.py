"""Order signals — sends transactional emails on lifecycle changes."""
from __future__ import annotations

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .models import Order
from .services import send_order_confirmation_email, send_order_status_update_email


# Track previous status for emitting status-change emails.
_PREVIOUS_STATUS_ATTR = '_previous_status'


@receiver(pre_save, sender=Order)
def _capture_previous_status(sender, instance: Order, **kwargs):
    if not instance.pk:
        setattr(instance, _PREVIOUS_STATUS_ATTR, None)
        return
    try:
        previous = sender.objects.only('status').get(pk=instance.pk)
        setattr(instance, _PREVIOUS_STATUS_ATTR, previous.status)
    except sender.DoesNotExist:
        setattr(instance, _PREVIOUS_STATUS_ATTR, None)


@receiver(post_save, sender=Order)
def _send_lifecycle_emails(sender, instance: Order, created: bool, **kwargs):
    if created:
        send_order_confirmation_email(instance)
        return

    previous = getattr(instance, _PREVIOUS_STATUS_ATTR, None)
    if previous and previous != instance.status:
        # Render previous human-readable label
        previous_display = dict(Order.Status.choices).get(previous, previous)
        send_order_status_update_email(instance, previous_status=previous_display)
