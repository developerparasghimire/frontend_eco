"""Service layer for the orders app — emails, payments, status transitions."""
from .emails import (
    send_order_confirmation_email,
    send_order_status_update_email,
    send_order_shipped_email,
    send_refund_email,
)
from .paypal import PayPalClient, PayPalError
from .stripe_client import StripeClient, StripeError

__all__ = [
    'send_order_confirmation_email',
    'send_order_status_update_email',
    'send_order_shipped_email',
    'send_refund_email',
    'PayPalClient',
    'PayPalError',
    'StripeClient',
    'StripeError',
]
