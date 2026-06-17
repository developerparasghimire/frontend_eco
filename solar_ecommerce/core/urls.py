import os

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework.permissions import IsAdminUser, AllowAny

from apps.orders.views import StripeWebhookView, PayPalWebhookView

# In production, restrict API docs to admins only
_docs_permission = AllowAny if settings.DEBUG else IsAdminUser

# Allow operators to relocate the admin URL via env var to slow automated probes.
ADMIN_URL = os.environ.get('DJANGO_ADMIN_URL', 'admin/').strip('/') + '/'


def root_status(_request):
    return JsonResponse(
        {
            'status': 'ok',
            'service': 'solar-backend',
            'admin': f'/{ADMIN_URL}',
            'schema': '/api/schema/',
        }
    )

urlpatterns = [
    path('', root_status),
    path(ADMIN_URL, admin.site.urls),

    # ── API v1 ────────────────────────────
    path('api/auth/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/returns/', include('apps.returns.urls')),
    path('api/wishlists/', include('apps.wishlists.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('api/coupons/', include('apps.coupons.urls')),
    path('api/contacts/', include('apps.contacts.urls')),
    path('api/shipping/', include('apps.shipping.urls')),

    # ── Webhooks (signature-verified, no auth) ──
    path('api/webhooks/stripe/', StripeWebhookView.as_view(), name='webhook_stripe'),
    path('api/webhooks/paypal/', PayPalWebhookView.as_view(), name='webhook_paypal'),

    # ── API Documentation (restricted in production) ──
    path('api/schema/', SpectacularAPIView.as_view(permission_classes=[_docs_permission]), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema', permission_classes=[_docs_permission]), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema', permission_classes=[_docs_permission]), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
