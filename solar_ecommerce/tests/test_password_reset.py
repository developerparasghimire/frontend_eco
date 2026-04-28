"""Tests for password reset (forgot/reset) endpoints."""
from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from django.core import mail
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.services import PasswordResetService
from tests.factories import UserFactory

User = get_user_model()
pytestmark = pytest.mark.django_db


FORGOT_URL = '/api/auth/forgot-password/'
RESET_URL = '/api/auth/reset-password/'


class TestForgotPassword:
    def test_existing_user_receives_email(self, settings):
        settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
        mail.outbox = []
        user = UserFactory(email='alice@test.com')
        client = APIClient()
        resp = client.post(FORGOT_URL, {'email': user.email})
        assert resp.status_code == status.HTTP_200_OK
        assert len(mail.outbox) == 1
        assert user.email in mail.outbox[0].to
        assert '/reset-password?uid=' in mail.outbox[0].body

    def test_unknown_email_returns_same_message(self, settings):
        settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
        mail.outbox = []
        client = APIClient()
        resp = client.post(FORGOT_URL, {'email': 'nobody@nowhere.com'})
        assert resp.status_code == status.HTTP_200_OK
        # Account-enumeration protection — no email sent, generic message
        assert len(mail.outbox) == 0
        assert 'reset link' in resp.data['detail'].lower()

    def test_invalid_email_format(self):
        client = APIClient()
        resp = client.post(FORGOT_URL, {'email': 'not-an-email'})
        assert resp.status_code == status.HTTP_400_BAD_REQUEST


class TestResetPassword:
    def _link(self, user):
        return PasswordResetService.build_link(user)

    def test_valid_token_resets_password(self):
        user = UserFactory()
        link = self._link(user)
        client = APIClient()
        resp = client.post(RESET_URL, {
            'uid': link.uid,
            'token': link.token,
            'new_password': 'BrandNewPass123!',
        })
        assert resp.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.check_password('BrandNewPass123!')

    def test_token_invalid_after_use(self):
        user = UserFactory()
        link = self._link(user)
        client = APIClient()
        client.post(RESET_URL, {
            'uid': link.uid, 'token': link.token, 'new_password': 'BrandNewPass123!',
        })
        resp = client.post(RESET_URL, {
            'uid': link.uid, 'token': link.token, 'new_password': 'AnotherPass456!',
        })
        # Default token generator invalidates after password change
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_bad_token_rejected(self):
        user = UserFactory()
        link = self._link(user)
        client = APIClient()
        resp = client.post(RESET_URL, {
            'uid': link.uid,
            'token': 'tampered-token',
            'new_password': 'BrandNewPass123!',
        })
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_weak_password_rejected(self):
        user = UserFactory()
        link = self._link(user)
        client = APIClient()
        resp = client.post(RESET_URL, {
            'uid': link.uid, 'token': link.token, 'new_password': '123',
        })
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
