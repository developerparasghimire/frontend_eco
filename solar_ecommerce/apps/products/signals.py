"""Product signals — low-stock alert dispatch."""
from __future__ import annotations

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Product

_PREVIOUS_STOCK_ATTR = '_previous_stock'


def _attach_previous_stock(instance: Product) -> None:
    if not instance.pk:
        instance._state.fields_cache  # noqa: B018
        setattr(instance, _PREVIOUS_STOCK_ATTR, None)
        return
    try:
        prev = Product.objects.only('stock').get(pk=instance.pk).stock
    except Product.DoesNotExist:
        prev = None
    setattr(instance, _PREVIOUS_STOCK_ATTR, prev)


@receiver(post_save, sender=Product)
def _check_low_stock(sender, instance: Product, created: bool, **kwargs):
    """Email admin when a product crosses the low-stock threshold downward."""
    threshold = getattr(settings, 'LOW_STOCK_THRESHOLD', 5)
    if instance.stock <= 0 or instance.stock > threshold:
        return

    # Avoid duplicate alerts: only send when stock just crossed the threshold.
    previous = getattr(instance, _PREVIOUS_STOCK_ATTR, None)
    if previous is not None and previous <= threshold:
        return

    # Lazy import keeps the products app independent from orders at import time.
    from apps.orders.tasks import send_low_stock_email_task
    send_low_stock_email_task.delay(str(instance.pk))