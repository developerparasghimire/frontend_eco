"""Order signals — dispatches transactional emails on lifecycle changes."""
from __future__ import annotations

import logging

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .models import Order
from .tasks import (
    send_order_confirmation_email_task,
    send_order_status_update_email_task,
)

logger = logging.getLogger(__name__)

# Track previous status for emitting status-change emails.
_PREVIOUS_STATUS_ATTR = '_previous_status'


def _dispatch_task(task, *args):
    """Dispatch a Celery task with a synchronous fallback if the broker is unavailable."""
    try:
        task.delay(*args)
    except Exception as exc:
        logger.warning(
            'Celery broker unavailable (%s); running %s synchronously.',
            exc, task.name,
        )
        try:
            task(*args)
        except Exception:
            logger.exception('Synchronous fallback for %s also failed.', task.name)


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
        _dispatch_task(send_order_confirmation_email_task, str(instance.pk))
        return

    previous = getattr(instance, _PREVIOUS_STATUS_ATTR, None)
    if previous and previous != instance.status:
        previous_display = dict(Order.Status.choices).get(previous, previous)
        _dispatch_task(send_order_status_update_email_task, str(instance.pk), previous_display)
