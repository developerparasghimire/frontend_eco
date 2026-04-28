"""Tests for PayPal + COD payment endpoints (PayPalClient is mocked)."""
from __future__ import annotations

from unittest.mock import patch

import pytest
from rest_framework import status

from apps.orders.models import Order, OrderItem
from apps.orders.services.paypal import PayPalError
from tests.factories import (
    AdminFactory,
    AddressFactory,
    CartFactory,
    CartItemFactory,
    ProductFactory,
    UserFactory,
)
from tests.test_users import auth_client

pytestmark = pytest.mark.django_db


def _create_order(user, payment_method=Order.PaymentMethod.PAYPAL) -> Order:
    """Helper: directly create an order + one item for the given user."""
    product = ProductFactory(price=100, stock=5)
    address = AddressFactory(user=user)
    order = Order.objects.create(
        user=user,
        payment_method=payment_method,
        shipping_full_name=address.full_name,
        shipping_phone=address.phone,
        shipping_address=address.address_line1,
        shipping_city=address.city,
        shipping_state=address.state,
        shipping_postal_code=address.postal_code,
        shipping_country=address.country,
        subtotal=100,
        installation_total=0,
        discount_amount=0,
        grand_total=100,
    )
    OrderItem.objects.create(
        order=order, product=product, product_name=product.name, sku=product.sku,
        unit_price=100, quantity=1,
    )
    return order


# ── PayPal create ─────────────────────────────

class TestPayPalCreate:
    def url(self, order):
        return f'/api/orders/list/{order.id}/payments/paypal/create/'

    @patch('apps.orders.views.PayPalClient.create_order')
    def test_create_paypal_order_success(self, mock_create):
        mock_create.return_value = {'id': 'PAYPAL-ORDER-123', 'status': 'CREATED', 'links': []}
        client, user = auth_client()
        order = _create_order(user)
        resp = client.post(self.url(order))
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data['paypal_order_id'] == 'PAYPAL-ORDER-123'
        order.refresh_from_db()
        assert order.payment_id == 'PAYPAL-ORDER-123'

    def test_rejects_non_paypal_orders(self):
        client, user = auth_client()
        order = _create_order(user, payment_method=Order.PaymentMethod.COD)
        resp = client.post(self.url(order))
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_other_user_cannot_create(self):
        owner = UserFactory()
        order = _create_order(owner)
        client, _ = auth_client()  # different user
        resp = client.post(self.url(order))
        # Owner check happens in OrderViewSet.get_queryset (filtered) → 404
        assert resp.status_code in (status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND)

    @patch('apps.orders.views.PayPalClient.create_order', side_effect=PayPalError('boom'))
    def test_paypal_failure_returns_502(self, _mock):
        client, user = auth_client()
        order = _create_order(user)
        resp = client.post(self.url(order))
        assert resp.status_code == status.HTTP_502_BAD_GATEWAY


# ── PayPal capture ────────────────────────────

class TestPayPalCapture:
    def url(self, order):
        return f'/api/orders/list/{order.id}/payments/paypal/capture/'

    @patch('apps.orders.views.PayPalClient.capture_order')
    def test_capture_marks_order_paid(self, mock_capture):
        mock_capture.return_value = {'status': 'COMPLETED'}
        client, user = auth_client()
        order = _create_order(user)
        order.payment_id = 'PAYPAL-ORDER-123'
        order.save(update_fields=['payment_id'])

        resp = client.post(self.url(order))
        assert resp.status_code == status.HTTP_200_OK
        order.refresh_from_db()
        assert order.payment_status == 'paid'
        assert order.paid_at is not None
        assert order.status == Order.Status.CONFIRMED

    @patch('apps.orders.views.PayPalClient.capture_order')
    def test_incomplete_capture_rejected(self, mock_capture):
        mock_capture.return_value = {'status': 'PENDING'}
        client, user = auth_client()
        order = _create_order(user)
        order.payment_id = 'PAYPAL-ORDER-123'
        order.save(update_fields=['payment_id'])
        resp = client.post(self.url(order))
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_missing_paypal_order_id(self):
        client, user = auth_client()
        order = _create_order(user)  # no payment_id
        resp = client.post(self.url(order))
        assert resp.status_code == status.HTTP_400_BAD_REQUEST


# ── COD mark-paid ─────────────────────────────

class TestCODMarkPaid:
    def url(self, order):
        return f'/api/orders/list/{order.id}/payments/cod/mark-paid/'

    def test_admin_can_mark_cod_paid(self):
        admin = AdminFactory()
        client, _ = auth_client(user=admin)
        order = _create_order(admin, payment_method=Order.PaymentMethod.COD)
        resp = client.post(self.url(order))
        assert resp.status_code == status.HTTP_200_OK
        order.refresh_from_db()
        assert order.payment_status == 'paid'

    def test_non_admin_forbidden(self):
        client, user = auth_client()
        order = _create_order(user, payment_method=Order.PaymentMethod.COD)
        resp = client.post(self.url(order))
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_paypal_order_rejected(self):
        admin = AdminFactory()
        client, _ = auth_client(user=admin)
        order = _create_order(admin, payment_method=Order.PaymentMethod.PAYPAL)
        resp = client.post(self.url(order))
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
