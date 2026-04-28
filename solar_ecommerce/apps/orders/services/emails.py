"""Transactional email helpers for the orders app."""
from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def _safe_send(subject: str, body: str, recipient: str) -> None:
    if not recipient:
        return
    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
        )
    except Exception:
        logger.exception("Failed to send transactional email to %s", recipient)


def _format_order_summary(order) -> str:
    lines = []
    for item in order.items.all():
        lines.append(
            f"  - {item.product_name} (SKU {item.sku})  x{item.quantity}  "
            f"= {item.line_total}"
        )
    return "\n".join(lines) or "  (no items)"


def send_order_confirmation_email(order) -> None:
    """Sent when an order is created (called from post_save signal)."""
    subject = f"Order confirmation — {order.order_number}"
    body = (
        f"Hi {order.shipping_full_name or order.user.email},\n\n"
        f"Thanks for your order! We've received order {order.order_number} "
        f"and will process it shortly.\n\n"
        f"Items:\n{_format_order_summary(order)}\n\n"
        f"Subtotal:        {order.subtotal}\n"
        f"Installation:    {order.installation_total}\n"
        f"Discount:        -{order.discount_amount}\n"
        f"Grand total:     {order.grand_total}\n\n"
        f"Payment method:  {order.get_payment_method_display()}\n"
        f"Payment status:  {order.get_payment_status_display() if hasattr(order, 'get_payment_status_display') else order.payment_status}\n\n"
        f"Shipping to:\n"
        f"  {order.shipping_full_name}\n"
        f"  {order.shipping_address}\n"
        f"  {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}\n"
        f"  {order.shipping_country}\n\n"
        f"Track your order: {settings.FRONTEND_URL}/dashboard/orders/{order.id}\n\n"
        f"— The Solar Team"
    )
    _safe_send(subject, body, order.user.email)


def send_order_status_update_email(order, previous_status: str) -> None:
    """Sent when an admin transitions an order to a new status."""
    subject = f"Order {order.order_number} — {order.get_status_display()}"
    body = (
        f"Hi {order.shipping_full_name or order.user.email},\n\n"
        f"Your order {order.order_number} has been updated:\n"
        f"  {previous_status}  →  {order.get_status_display()}\n\n"
        f"Track your order: {settings.FRONTEND_URL}/dashboard/orders/{order.id}\n\n"
        f"— The Solar Team"
    )
    _safe_send(subject, body, order.user.email)
