import os

from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.tokens import RefreshToken

from apps.throttles import AuthRateThrottle
from .models import Address
from .serializers import (
    AddressSerializer,
    ChangePasswordSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)
from .services import AccountActivationService, PasswordResetService

User = get_user_model()


# ── Authentication ────────────────────────────

class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/

    Creates an inactive user and emails a 6-digit OTP code. The user must
    enter the code on the verification page before they can log in.
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        AccountActivationService.send_activation_email(user)
        return Response({
            'detail': (
                'Account created. We just sent a 6-digit activation code to '
                f'{user.email}. Please check your inbox (and spam folder) '
                'and enter the code to verify your email before signing in.'
            ),
            'email': user.email,
        }, status=status.HTTP_201_CREATED)


class VerifyEmailOTPView(APIView):
    """POST /api/auth/verify-email/  – {"email": "...", "code": "123456"}

    Verifies the 6-digit OTP sent on registration and activates the account.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        email = (request.data.get('email') or '').strip()
        code = (request.data.get('code') or '').strip()
        if not email or not code:
            return Response(
                {'detail': 'Both email and code are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = AccountActivationService.verify_otp(email, code)
        if user is None:
            return Response(
                {'detail': 'Invalid or expired activation code.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {'detail': 'Email verified successfully. You can now log in.'},
            status=status.HTTP_200_OK,
        )


class ResendActivationView(APIView):
    """POST /api/auth/resend-activation/  – {"email": "..."}

    Always returns 200 to prevent account enumeration.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        email = (request.data.get('email') or '').strip()
        if email:
            user = User.objects.filter(email__iexact=email, is_active=False).first()
            if user:
                AccountActivationService.send_activation_email(user)
        return Response(
            {'detail': 'If a matching inactive account exists, a new activation code has been sent.'},
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """POST /api/auth/logout/  – blacklist the refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'detail': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Logged out successfully.'}, status=status.HTTP_200_OK)


# ── Profile ───────────────────────────────────

class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/profile/"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    """PUT /api/auth/change-password/"""
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Password updated.'}, status=status.HTTP_200_OK)


# ── Password reset (forgot / reset) ──────────

class PasswordResetRequestView(APIView):
    """
    POST /api/auth/forgot-password/

    Always returns 200 with a generic message to prevent account enumeration.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]
    serializer_class = PasswordResetRequestSerializer  # for schema discovery

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            PasswordResetService.send_reset_email(user)

        return Response(
            {'detail': 'If an account exists for that email, a reset link has been sent.'},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """POST /api/auth/reset-password/  – consume token + set new password."""
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Password has been reset.'}, status=status.HTTP_200_OK)



# ── Addresses ─────────────────────────────────

class AddressViewSet(ModelViewSet):
    """CRUD /api/auth/addresses/"""
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


# ── Admin Dashboard ──────────────────────────

class AdminDashboardView(APIView):
    """GET /api/auth/admin/dashboard/ – admin-only stats."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        from apps.orders.models import Order
        from apps.products.models import Product, Category
        from apps.contacts.models import ContactMessage, NewsletterSubscriber

        now = timezone.now()
        thirty_days_ago = now - timezone.timedelta(days=30)

        # Order stats
        orders_qs = Order.objects.all()
        order_stats = orders_qs.aggregate(
            total_orders=Count('id'),
            total_revenue=Sum('grand_total'),
            pending_orders=Count('id', filter=Q(status='pending')),
            delivered_orders=Count('id', filter=Q(status='delivered')),
            cancelled_orders=Count('id', filter=Q(status='cancelled')),
        )
        recent_orders = orders_qs.filter(created_at__gte=thirty_days_ago).aggregate(
            count=Count('id'),
            revenue=Sum('grand_total'),
        )

        # Product & category stats
        low_stock_threshold = getattr(settings, 'LOW_STOCK_THRESHOLD', 5)
        product_stats = {
            'total_products': Product.objects.count(),
            'active_products': Product.objects.filter(is_active=True).count(),
            'out_of_stock': Product.objects.filter(stock=0, is_active=True).count(),
            'low_stock': Product.objects.filter(
                is_active=True, stock__gt=0, stock__lte=low_stock_threshold,
            ).count(),
            'featured_products': Product.objects.filter(is_featured=True).count(),
            'total_categories': Category.objects.filter(is_active=True).count(),
        }

        # Customer stats
        customer_stats = {
            'total_customers': User.objects.filter(is_staff=False).count(),
            'new_customers_30d': User.objects.filter(
                is_staff=False, date_joined__gte=thirty_days_ago,
            ).count(),
        }

        # Support & newsletter
        support_stats = {
            'new_messages': ContactMessage.objects.filter(status='new').count(),
            'newsletter_subscribers': NewsletterSubscriber.objects.filter(is_active=True).count(),
        }

        return Response({
            'orders': {**order_stats, 'total_revenue': str(order_stats['total_revenue'] or 0)},
            'recent_30d': {
                'orders': recent_orders['count'] or 0,
                'revenue': str(recent_orders['revenue'] or 0),
            },
            'products': product_stats,
            'customers': customer_stats,
            'support': support_stats,
        })


class GoogleLoginView(APIView):
    """POST /api/auth/google/  – {"credential": "<Google ID token>"}

    Verifies the Google ID token, then creates or retrieves the matching user
    and returns a JWT access/refresh pair exactly like the normal login view.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        credential = (request.data.get('credential') or '').strip()
        if not credential:
            return Response({'detail': 'credential is required.'}, status=status.HTTP_400_BAD_REQUEST)

        client_id = os.environ.get('GOOGLE_CLIENT_ID', '')
        if not client_id:
            return Response({'detail': 'Google login is not configured on this server.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests
            idinfo = id_token.verify_oauth2_token(credential, google_requests.Request(), client_id)
        except ValueError as exc:
            return Response({'detail': f'Invalid Google token: {exc}'}, status=status.HTTP_400_BAD_REQUEST)

        email = idinfo.get('email', '').lower()
        if not email or not idinfo.get('email_verified'):
            return Response({'detail': 'Google account email is not verified.'}, status=status.HTTP_400_BAD_REQUEST)

        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split('@')[0],
                'first_name': first_name,
                'last_name': last_name,
                'is_active': True,
            },
        )
        if created:
            user.set_unusable_password()
            user.save(update_fields=['password'])
        elif not user.is_active:
            user.is_active = True
            user.save(update_fields=['is_active'])

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': str(user.id),
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
            },
        }, status=status.HTTP_200_OK)


class AdminCustomerListView(generics.ListAPIView):
    """GET /api/auth/admin/customers/ – paginated list of non-staff users."""
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer

    def get_queryset(self):
        qs = User.objects.filter(is_staff=False).order_by('-date_joined')
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(email__icontains=search)
                | Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )
        return qs
