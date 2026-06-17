"""Transactional email helpers — HTML templates with plain-text fallback."""
from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def _send_html_email(*, subject: str, template: str, context: dict, recipient: str) -> None:
    """Render an HTML template and send it as an EmailMultiAlternatives message."""
    if not recipient:
        return
    ctx = {
        'frontend_url': settings.FRONTEND_URL,
        'support_email': getattr(settings, 'SUPPORT_EMAIL', settings.DEFAULT_FROM_EMAIL),
        'now': timezone.now(),
        'subject': subject,
        **context,
    }
    try:
        html_body = render_to_string(template, ctx)
        text_body = strip_tags(html_body)
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient],
        )
        msg.attach_alternative(html_body, 'text/html')
        msg.send(fail_silently=False)
    except Exception:
        logger.exception('Failed to send email "%s" to %s', subject, recipient)


# ── Public API ──────────────────────────────────────────────────────────────

def _order_recipient(order) -> str:
    """Resolve the email to send order notifications to.

    Works for both registered users and guest checkouts.
    """
    fn = getattr(order, 'customer_email', None)
    if fn:
        return fn
    if getattr(order, 'user_id', None):
        return order.user.email
    return getattr(order, 'guest_email', '') or ''


def send_order_confirmation_email(order) -> None:
    """Sent when an order is created (called from post_save signal / Celery)."""
    _send_html_email(
        subject=f'Order confirmation — {order.order_number}',
        template='emails/order_confirmation.html',
        context={'order': order},
        recipient=_order_recipient(order),
    )


def send_order_status_update_email(order, previous_status: str) -> None:
    _send_html_email(
        subject=f'Order {order.order_number} — {order.get_status_display()}',
        template='emails/order_status_update.html',
        context={'order': order, 'previous_status': previous_status},
        recipient=_order_recipient(order),
    )


def send_order_shipped_email(order) -> None:
    """Convenience helper used after admin sets tracking details."""
    _send_html_email(
        subject=f'Your order {order.order_number} has shipped',
        template='emails/order_status_update.html',
        context={'order': order, 'previous_status': 'processing'},
        recipient=_order_recipient(order),
    )


def send_refund_email(order, amount, reference: str = '') -> None:
    _send_html_email(
        subject=f'Refund processed — order {order.order_number}',
        template='emails/refund.html',
        context={'order': order, 'amount': amount, 'reference': reference},
        recipient=_order_recipient(order),
    )


def send_low_stock_email(product) -> None:
    recipient = getattr(settings, 'ADMIN_EMAIL', '')
    if not recipient:
        return
    _send_html_email(
        subject=f'Low stock: {product.name}',
        template='emails/low_stock.html',
        context={'product': product},
        recipient=recipient,
    )
