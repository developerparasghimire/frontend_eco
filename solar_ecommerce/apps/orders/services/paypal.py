"""
Thin PayPal REST API client (sandbox + live).

We deliberately avoid the deprecated `paypalrestsdk` package and call the
REST API directly with `requests` (already a transitive dep). Implements
just the two endpoints we need: create order + capture order.

Reference: https://developer.paypal.com/docs/api/orders/v2/
"""
from __future__ import annotations

import logging
from decimal import Decimal
from typing import Any

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class PayPalError(Exception):
    """Raised when the PayPal API call fails or is misconfigured."""


class PayPalClient:
    """
    Stateless wrapper. Acquires an OAuth token per call (PayPal tokens are
    valid ~9 hours, but caching is unnecessary at low call volume — keep
    the implementation simple and stateless).
    """

    def __init__(self) -> None:
        self.base_url = settings.PAYPAL_BASE_URL
        self.client_id = settings.PAYPAL_CLIENT_ID
        self.client_secret = settings.PAYPAL_CLIENT_SECRET
        self.timeout = settings.PAYPAL_REQUEST_TIMEOUT
        self.currency = settings.PAYPAL_CURRENCY

    # ── auth ────────────────────────────────────
    def _access_token(self) -> str:
        if not self.client_id or not self.client_secret:
            raise PayPalError("PayPal is not configured (PAYPAL_CLIENT_ID / SECRET missing).")
        try:
            resp = requests.post(
                f"{self.base_url}/v1/oauth2/token",
                auth=(self.client_id, self.client_secret),
                data={"grant_type": "client_credentials"},
                headers={"Accept": "application/json"},
                timeout=self.timeout,
            )
        except requests.RequestException as exc:
            logger.exception("PayPal token request failed")
            raise PayPalError("PayPal connection error.") from exc

        if resp.status_code != 200:
            logger.error("PayPal token error %s: %s", resp.status_code, resp.text[:500])
            raise PayPalError("Failed to authenticate with PayPal.")
        return resp.json()["access_token"]

    def _request(self, method: str, path: str, json: dict[str, Any] | None = None) -> dict[str, Any]:
        token = self._access_token()
        try:
            resp = requests.request(
                method,
                f"{self.base_url}{path}",
                json=json,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                timeout=self.timeout,
            )
        except requests.RequestException as exc:
            logger.exception("PayPal %s %s failed", method, path)
            raise PayPalError("PayPal connection error.") from exc

        if resp.status_code >= 400:
            logger.error("PayPal %s %s -> %s: %s", method, path, resp.status_code, resp.text[:500])
            raise PayPalError(f"PayPal request failed ({resp.status_code}).")
        return resp.json() if resp.content else {}

    # ── orders ──────────────────────────────────
    def create_order(self, order) -> dict[str, Any]:
        """Create a PayPal order matching the local Order's grand_total."""
        amount = Decimal(order.grand_total).quantize(Decimal("0.01"))
        payload = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "reference_id": str(order.id),
                "description": f"Solar order {order.order_number}",
                "amount": {
                    "currency_code": self.currency,
                    "value": f"{amount:.2f}",
                },
            }],
            "application_context": {
                "brand_name": "Solar",
                "user_action": "PAY_NOW",
                "return_url": f"{settings.FRONTEND_URL}/checkout/paypal/return",
                "cancel_url": f"{settings.FRONTEND_URL}/checkout/paypal/cancel",
            },
        }
        return self._request("POST", "/v2/checkout/orders", json=payload)

    def capture_order(self, paypal_order_id: str) -> dict[str, Any]:
        """Capture funds for a previously created PayPal order."""
        if not paypal_order_id:
            raise PayPalError("PayPal order id is required.")
        return self._request("POST", f"/v2/checkout/orders/{paypal_order_id}/capture")
