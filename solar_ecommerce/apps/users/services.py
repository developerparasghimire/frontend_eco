"""
Service layer for the users app.

Encapsulates side-effecting business logic (email delivery, token handling)
so views and serializers stay thin and testable.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator, default_token_generator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

logger = logging.getLogger(__name__)
User = get_user_model()


# ──────────────────────────────────────────────
# Password reset
# ──────────────────────────────────────────────

@dataclass(frozen=True)
class PasswordResetLink:
    uid: str
    token: str
    url: str


class PasswordResetService:
    """Generate and validate password-reset tokens, and send the email."""

    token_generator: PasswordResetTokenGenerator = default_token_generator

    @classmethod
    def build_link(cls, user) -> PasswordResetLink:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = cls.token_generator.make_token(user)
        # Frontend route convention: /reset-password?uid=<uid>&token=<token>
        url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
        return PasswordResetLink(uid=uid, token=token, url=url)

    @classmethod
    def get_user_for_token(cls, uidb64: str, token: str) -> Optional["User"]:
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return None
        except Exception:
            return None
        if not cls.token_generator.check_token(user, token):
            return None
        return user

    @classmethod
    def send_reset_email(cls, user) -> PasswordResetLink:
        link = cls.build_link(user)
        subject = "Reset your Solar account password"
        # Plain-text body — keep it simple, render templates later if desired.
        body = (
            f"Hi {user.full_name or user.email},\n\n"
            f"We received a request to reset the password for your Solar account.\n"
            f"Click the link below to set a new password (valid for "
            f"{settings.PASSWORD_RESET_TIMEOUT_HOURS} hours):\n\n"
            f"{link.url}\n\n"
            f"If you did not request a password reset, you can safely ignore this email.\n\n"
            f"— The Solar Team"
        )
        try:
            send_mail(
                subject=subject,
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception:
            # Never leak account existence; log for ops.
            logger.exception("Failed to send password reset email to %s", user.pk)
        return link
