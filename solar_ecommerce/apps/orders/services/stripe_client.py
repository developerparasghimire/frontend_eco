"""
Stripe REST client wrapper.

Uses the official `stripe` Python library and exposes a thin façade matching
the patterns used by `paypal.py`: stateless object, narrow API surface, and
one custom exception type so views can return clean error messages.

Reference: https://docs.stripe.com/api
"""
from __future__ import annotations

import logging
from decimal import Decimal
from typing import Any

import stripe
from django.conf import settings

logger = logging.getLogger(__name__)


class StripeError(Exception):
    """Raised when a Stripe API call fails or is misconfigured."""


def _ensure_configured() -> None:
    if not settings.STRIPE_SECRET_KEY:
        raise StripeError('Stripe is not configured (STRIPE_SECRET_KEY missing).')
    stripe.api_key = settings.STRIPE_SECRET_KEY


def _amount_for_stripe(value) -> int:
    """Convert a Decimal amount to the smallest currency unit (paise/cents)."""
    multiplier = settings.STRIPE_AMOUNT_MULTIPLIER
    return int((Decimal(value) * multiplier).quantize(Decimal('1')))


class StripeClient:
    """Thin stateless wrapper around the operations our app needs."""

    # ── PaymentIntent ───────────────────────────
    def create_payment_intent(self, order) -> dict[str, Any]:
        _ensure_configured()
        try:
            intent = stripe.PaymentIntent.create(
                amount=_amount_for_stripe(order.grand_total),
                currency=settings.STRIPE_CURRENCY,
                metadata={
                    'order_id': str(order.id),
                    'order_number': order.order_number,
                    'user_id': str(order.user_id),
                },
                description=f'Solar order {order.order_number}',
                payment_method_types=['card'],
            )
        except stripe.error.StripeError as exc:
            logger.exception('Stripe PaymentIntent.create failed')
            raise StripeError(str(exc.user_message or exc)) from exc
        return intent

    def retrieve_payment_intent(self, intent_id: str) -> dict[str, Any]:
        _ensure_configured()
        try:
            return stripe.PaymentIntent.retrieve(intent_id)
        except stripe.error.StripeError as exc:
            logger.exception('Stripe PaymentIntent.retrieve failed')
            raise StripeError(str(exc.user_message or exc)) from exc

    # ── Refund ──────────────────────────────────
    def create_refund(self, payment_intent_id: str, amount=None,
                      reason: str | None = None) -> dict[str, Any]:
        _ensure_configured()
        if not payment_intent_id:
            raise StripeError('payment_intent_id is required.')
        kwargs: dict[str, Any] = {'payment_intent': payment_intent_id}
        if amount is not None:
            kwargs['amount'] = _amount_for_stripe(amount)
        if reason in {'duplicate', 'fraudulent', 'requested_by_customer'}:
            kwargs['reason'] = reason
        try:
            return stripe.Refund.create(**kwargs)
        except stripe.error.StripeError as exc:
            logger.exception('Stripe Refund.create failed')
            raise StripeError(str(exc.user_message or exc)) from exc

    # ── Webhook ─────────────────────────────────
    def construct_webhook_event(self, payload: bytes, signature: str):
        _ensure_configured()
        if not settings.STRIPE_WEBHOOK_SECRET:
            raise StripeError('STRIPE_WEBHOOK_SECRET not configured.')
        try:
            return stripe.Webhook.construct_event(
                payload, signature, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError) as exc:
            logger.warning('Stripe webhook signature verification failed: %s', exc)
            raise StripeError('Invalid webhook signature.') from exc
