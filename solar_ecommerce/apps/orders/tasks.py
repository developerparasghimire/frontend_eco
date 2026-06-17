"""
Celery tasks for the orders app.

In development `CELERY_TASK_ALWAYS_EAGER=True` runs these synchronously, so
callers don't need to know whether a worker is configured. In production a
worker should be deployed (`celery -A core worker -l info`).
"""
from __future__ import annotations

import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=30, ignore_result=True)
def send_order_confirmation_email_task(self, order_id):
    from .models import Order
    from .services import send_order_confirmation_email

    try:
        order = Order.objects.select_related('user').prefetch_related('items').get(pk=order_id)
        send_order_confirmation_email(order)
    except Order.DoesNotExist:
        logger.warning('send_order_confirmation: order %s not found', order_id)
    except Exception as exc:  # pragma: no cover - retry path
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=30, ignore_result=True)
def send_order_status_update_email_task(self, order_id, previous_status: str):
    from .models import Order
    from .services import send_order_status_update_email

    try:
        order = Order.objects.select_related('user').get(pk=order_id)
        send_order_status_update_email(order, previous_status=previous_status)
    except Order.DoesNotExist:
        logger.warning('send_status_update: order %s not found', order_id)
    except Exception as exc:  # pragma: no cover
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=30, ignore_result=True)
def send_refund_email_task(self, order_id, amount, reference: str = ''):
    from .models import Order
    from .services import send_refund_email

    try:
        order = Order.objects.select_related('user').get(pk=order_id)
        send_refund_email(order, amount=amount, reference=reference)
    except Order.DoesNotExist:
        logger.warning('send_refund_email: order %s not found', order_id)
    except Exception as exc:  # pragma: no cover
        raise self.retry(exc=exc)


@shared_task(ignore_result=True)
def send_low_stock_email_task(product_id):
    from apps.products.models import Product
    from .services.emails import send_low_stock_email

    try:
        send_low_stock_email(Product.objects.get(pk=product_id))
    except Product.DoesNotExist:
        return
