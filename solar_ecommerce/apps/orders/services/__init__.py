"""Service layer for the orders app — emails, payments, status transitions."""
from .emails import (
    send_order_confirmation_email,
    send_order_status_update_email,
)
from .paypal import PayPalClient, PayPalError

__all__ = [
    'send_order_confirmation_email',
    'send_order_status_update_email',
    'PayPalClient',
    'PayPalError',
]
