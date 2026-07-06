import os
from pathlib import Path
from datetime import timedelta


def env_bool(name: str, default: bool = False) -> bool:
    return os.environ.get(name, str(default)).lower() in {'1', 'true', 'yes', 'on'}


def env_list(name: str, default: str = '') -> list[str]:
    return [item.strip() for item in os.environ.get(name, default).split(',') if item.strip()]


BASE_DIR = Path(__file__).resolve().parent.parent

DEBUG = env_bool('DJANGO_DEBUG', False)

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', '')
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = 'django-insecure-dev-only-key-do-not-use-in-production'
    else:
        raise RuntimeError('DJANGO_SECRET_KEY environment variable is required in production.')


if DEBUG:
    ALLOWED_HOSTS = ['*']
else:
    ALLOWED_HOSTS = env_list('DJANGO_ALLOWED_HOSTS')
    if not ALLOWED_HOSTS:
        raise RuntimeError(
            'DJANGO_ALLOWED_HOSTS environment variable is required in production.'
        )

CSRF_TRUSTED_ORIGINS = env_list('CSRF_TRUSTED_ORIGINS')

# ──────────────────────────────────────────────
# Application definition
# ──────────────────────────────────────────────

DJANGO_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'django_celery_beat',
]

LOCAL_APPS = [
    'apps.users',
    'apps.products',
    'apps.orders',
    'apps.reviews',
    'apps.wishlists',
    'apps.coupons',
    'apps.contacts',
    'apps.shipping',
    'apps.returns',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # must be first to add CORS headers early
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'apps.middleware.InputSanitizationMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.middleware.SecurityHeadersMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# ──────────────────────────────────────────────
# Database
# ──────────────────────────────────────────────

# Keep SQLite as the default database for simple Docker deployment.
# Switch to PostgreSQL by setting USE_POSTGRES=true or DB_HOST.
if env_bool('USE_POSTGRES', False) or os.environ.get('DB_HOST'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'solar_db'),
            'USER': os.environ.get('DB_USER', 'solar_user'),
            'PASSWORD': os.environ.get('DB_PASSWORD', ''),
            'HOST': os.environ.get('DB_HOST', 'db'),
            'PORT': os.environ.get('DB_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.environ.get('SQLITE_PATH', str(BASE_DIR / 'db.sqlite3')),
        }
    }

# ──────────────────────────────────────────────
# Auth
# ──────────────────────────────────────────────

AUTH_USER_MODEL = 'users.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ──────────────────────────────────────────────
# Internationalization
# ──────────────────────────────────────────────

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ──────────────────────────────────────────────
# Static & Media
# ──────────────────────────────────────────────

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

# ──────────────────────────────────────────────
# Django REST Framework
# ──────────────────────────────────────────────

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/minute',
        'user': '120/minute',
        'auth': '5/minute',       # login / register
        'contact': '3/minute',    # contact form / newsletter
        'coupon': '20/minute',    # coupon code apply / preview
    },
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'EXCEPTION_HANDLER': 'apps.exceptions.custom_exception_handler',
    # JSON-only in production (no Browsable API to prevent info leakage)
    'DEFAULT_RENDERER_CLASSES': (
        ['rest_framework.renderers.JSONRenderer', 'rest_framework.renderers.BrowsableAPIRenderer']
        if DEBUG else ['rest_framework.renderers.JSONRenderer']
    ),
}

# ──────────────────────────────────────────────
# API Documentation (drf-spectacular)
# ──────────────────────────────────────────────

SPECTACULAR_SETTINGS = {
    'TITLE': 'Solar E-Commerce API',
    'DESCRIPTION': 'Professional REST API for solar energy products e-commerce platform.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/',
}

# ──────────────────────────────────────────────
# Simple JWT
# ──────────────────────────────────────────────

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ──────────────────────────────────────────────
# CORS  (Next.js frontend)
# ──────────────────────────────────────────────

# In development allow all origins to simplify local frontend + backend setup.
# In production override via environment variable `CORS_ALLOWED_ORIGINS`.
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
    CORS_ALLOW_CREDENTIALS = True
else:
    CORS_ALLOWED_ORIGINS = env_list('CORS_ALLOWED_ORIGINS')
    if not CORS_ALLOWED_ORIGINS:
        raise RuntimeError(
            'CORS_ALLOWED_ORIGINS environment variable is required in production.'
        )
    CORS_ALLOW_CREDENTIALS = True

# ──────────────────────────────────────────────
# Default primary key field type
# ──────────────────────────────────────────────

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ──────────────────────────────────────────────
# Security Hardening
# ──────────────────────────────────────────────

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True

if not DEBUG:
    # HTTPS / HSTS — secure-by-default in production. Override via env if behind
    # a TLS-terminating proxy that handles redirects.
    SECURE_SSL_REDIRECT = env_bool('DJANGO_SECURE_SSL_REDIRECT', True)
    SECURE_HSTS_SECONDS = int(os.environ.get('DJANGO_SECURE_HSTS_SECONDS', '31536000'))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = SECURE_HSTS_SECONDS > 0
    SECURE_HSTS_PRELOAD = SECURE_HSTS_SECONDS > 0

    # Cookies
    secure_cookies = env_bool('DJANGO_SECURE_COOKIES', SECURE_SSL_REDIRECT)
    SESSION_COOKIE_SECURE = secure_cookies
    CSRF_COOKIE_SECURE = secure_cookies
    SESSION_COOKIE_HTTPONLY = True
    CSRF_COOKIE_HTTPONLY = True

    # Headers
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
    SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin'
else:
    # Dev-friendly defaults
    X_FRAME_OPTIONS = 'SAMEORIGIN'
    SESSION_COOKIE_HTTPONLY = True

# ──────────────────────────────────────────────
# Email
# ──────────────────────────────────────────────
# Console backend in dev (prints to stdout). SMTP via env vars in production.
if env_bool('USE_SMTP_EMAIL', not DEBUG):
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
    EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
    EMAIL_USE_TLS = env_bool('EMAIL_USE_TLS', True)
    EMAIL_USE_SSL = env_bool('EMAIL_USE_SSL', False)
    EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
    EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
    EMAIL_TIMEOUT = int(os.environ.get('EMAIL_TIMEOUT', '15'))
else:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'Solar <no-reply@solar.local>')
SUPPORT_EMAIL = os.environ.get('SUPPORT_EMAIL', 'support@solar.local')

# URL base for links rendered in outgoing emails (password reset, order confirmations)
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000').rstrip('/')

# Public origin of the Django backend (used in account-activation links sent
# in emails — the link must hit a backend GET endpoint, then redirects back
# to the frontend). Leave blank to fall back to FRONTEND_URL + /api/...
# (works when Nginx proxies /api/* to Django).
BACKEND_PUBLIC_URL = os.environ.get('BACKEND_PUBLIC_URL', 'http://localhost:8000').rstrip('/')

# Password reset token lifetime (hours)
PASSWORD_RESET_TIMEOUT_HOURS = int(os.environ.get('PASSWORD_RESET_TIMEOUT_HOURS', '2'))
PASSWORD_RESET_TIMEOUT = PASSWORD_RESET_TIMEOUT_HOURS * 3600  # consumed by Django's token generator

# ──────────────────────────────────────────────
# Payments — PayPal
# ──────────────────────────────────────────────
PAYPAL_MODE = os.environ.get('PAYPAL_MODE', 'sandbox')  # 'sandbox' or 'live'
PAYPAL_CLIENT_ID = os.environ.get('PAYPAL_CLIENT_ID', '')
PAYPAL_CLIENT_SECRET = os.environ.get('PAYPAL_CLIENT_SECRET', '')
PAYPAL_BASE_URL = (
    'https://api-m.paypal.com' if PAYPAL_MODE == 'live'
    else 'https://api-m.sandbox.paypal.com'
)
PAYPAL_CURRENCY = os.environ.get('PAYPAL_CURRENCY', 'USD')
PAYPAL_REQUEST_TIMEOUT = int(os.environ.get('PAYPAL_REQUEST_TIMEOUT', '20'))
# Required for webhook signature verification (Developer Dashboard → Webhook ID)
PAYPAL_WEBHOOK_ID = os.environ.get('PAYPAL_WEBHOOK_ID', '')

# ──────────────────────────────────────────────
# Payments — Stripe
# ──────────────────────────────────────────────
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')
STRIPE_CURRENCY = os.environ.get('STRIPE_CURRENCY', 'inr').lower()
# Smallest-unit multiplier (paise/cents). Override for zero-decimal currencies (jpy, krw).
STRIPE_AMOUNT_MULTIPLIER = int(os.environ.get('STRIPE_AMOUNT_MULTIPLIER', '100'))

# ──────────────────────────────────────────────
# Tax & shipping defaults
# ──────────────────────────────────────────────
from decimal import Decimal as _Dec
TAX_RATE_PERCENT = _Dec(os.environ.get('TAX_RATE_PERCENT', '18'))   # GST 18% default
DEFAULT_SHIPPING_RATE = _Dec(os.environ.get('DEFAULT_SHIPPING_RATE', '0'))
FREE_SHIPPING_ABOVE = _Dec(os.environ.get('FREE_SHIPPING_ABOVE', '50000'))

# ──────────────────────────────────────────────
# Admin alerts
# ──────────────────────────────────────────────
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', '')
LOW_STOCK_THRESHOLD = int(os.environ.get('LOW_STOCK_THRESHOLD', '5'))

# ──────────────────────────────────────────────
# Cache (Redis) — falls back to local-memory cache when REDIS_URL is unset
# ──────────────────────────────────────────────
REDIS_URL = os.environ.get('REDIS_URL', '')
if REDIS_URL:
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': REDIS_URL,
            'OPTIONS': {'CLIENT_CLASS': 'django_redis.client.DefaultClient'},
            'KEY_PREFIX': 'solar',
            'TIMEOUT': 60 * 5,
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'solar-default',
        }
    }

# ──────────────────────────────────────────────
# Celery (background tasks)
# ──────────────────────────────────────────────
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', REDIS_URL or 'memory://')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', REDIS_URL or 'cache+memory://')
CELERY_TASK_ALWAYS_EAGER = env_bool('CELERY_TASK_ALWAYS_EAGER', DEBUG)  # synchronous in dev
CELERY_TASK_EAGER_PROPAGATES = True
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TIME_LIMIT = 60
CELERY_TASK_SOFT_TIME_LIMIT = 50
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# ──────────────────────────────────────────────
# Cloud media storage (S3 / DigitalOcean Spaces) — opt-in
# ──────────────────────────────────────────────
USE_S3 = env_bool('USE_S3', False)
if USE_S3:
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID', '')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
    AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME', '')
    AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', 'ap-south-1')
    AWS_S3_ENDPOINT_URL = os.environ.get('AWS_S3_ENDPOINT_URL', '') or None
    AWS_S3_CUSTOM_DOMAIN = os.environ.get('AWS_S3_CUSTOM_DOMAIN', '') or None
    AWS_DEFAULT_ACL = None  # bucket-policy controlled, never set object ACLs
    AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}
    AWS_QUERYSTRING_AUTH = False  # public reads via bucket policy
    STORAGES['default'] = {'BACKEND': 'storages.backends.s3.S3Storage'}
    if AWS_S3_CUSTOM_DOMAIN:
        MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/'

# ──────────────────────────────────────────────
# File Upload Limits
# ──────────────────────────────────────────────

DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024   # 10 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024   # 10 MB

# Custom: max sizes for images & documents (validated in serializers)
MAX_IMAGE_UPLOAD_SIZE = 5 * 1024 * 1024           # 5 MB
MAX_DOCUMENT_UPLOAD_SIZE = 10 * 1024 * 1024        # 10 MB
ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
ALLOWED_DOCUMENT_TYPES = ['application/pdf']

# ──────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────
# Structured logs to stdout (captured by Docker / hosting platform).
# Production should also forward to a log aggregator (e.g. Datadog, Loki).
_LOG_LEVEL = os.environ.get('DJANGO_LOG_LEVEL', 'DEBUG' if DEBUG else 'INFO')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {name} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': _LOG_LEVEL,
    },
    'loggers': {
        'django': {'handlers': ['console'], 'level': _LOG_LEVEL, 'propagate': False},
        'django.security': {'handlers': ['console'], 'level': 'WARNING', 'propagate': False},
        'django.request': {'handlers': ['console'], 'level': 'WARNING', 'propagate': False},
        'apps': {'handlers': ['console'], 'level': _LOG_LEVEL, 'propagate': False},
    },
}

# ──────────────────────────────────────────────
# Django Jazzmin — Admin UI customisation
# ──────────────────────────────────────────────
JAZZMIN_SETTINGS = {
    # Title / branding
    "site_title": "EcoPlanet Solar Admin",
    "site_header": "EcoPlanet Solar",
    "site_brand": "🌿 EcoPlanet Solar",
    "site_logo": None,
    "login_logo": None,
    "login_logo_dark": None,
    "site_logo_classes": "img-circle",
    "site_icon": None,
    "welcome_sign": "Welcome to the EcoPlanet Solar Admin Panel",
    "copyright": "© EcoPlanet Solar Pvt. Ltd.",

    # Top search
    "search_model": ["products.Product", "orders.Order", "users.User"],

    # Top-bar links
    "topmenu_links": [
        {"name": "Dashboard", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "🛍 Products", "model": "products.Product"},
        {"name": "📦 Orders", "model": "orders.Order"},
        {"name": "👥 Customers", "model": "users.User"},
        {"name": "🌐 Visit Site", "url": "/", "new_window": True},
    ],

    # User menu links
    "usermenu_links": [
        {"name": "My Profile", "url": "admin:users_user_change", "icon": "fas fa-user"},
    ],

    # Sidebar
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": ["auth"],
    "hide_models": [],

    # App/model ordering in sidebar
    "order_with_respect_to": [
        "products",
        "orders",
        "users",
        "coupons",
        "reviews",
        "contacts",
        "shipping",
        "returns",
    ],

    # Model icons (FontAwesome 5)
    "icons": {
        "auth.user": "fas fa-user-shield",
        "auth.Group": "fas fa-users",
        "products": "fas fa-solar-panel",
        "products.Category": "fas fa-tags",
        "products.Product": "fas fa-solar-panel",
        "products.ProductImage": "fas fa-images",
        "orders": "fas fa-shopping-cart",
        "orders.Order": "fas fa-shopping-cart",
        "orders.OrderItem": "fas fa-list-ul",
        "orders.Cart": "fas fa-shopping-basket",
        "orders.CartItem": "fas fa-minus-circle",
        "orders.WarrantyDocument": "fas fa-file-certificate",
        "users": "fas fa-users",
        "users.User": "fas fa-user-circle",
        "users.Address": "fas fa-map-marker-alt",
        "users.EmailVerificationOTP": "fas fa-key",
        "reviews": "fas fa-star",
        "reviews.Review": "fas fa-star",
        "coupons": "fas fa-ticket-alt",
        "coupons.Coupon": "fas fa-percent",
        "coupons.CouponUsage": "fas fa-receipt",
        "contacts": "fas fa-envelope",
        "contacts.ContactMessage": "fas fa-envelope-open-text",
        "contacts.NewsletterSubscriber": "fas fa-bell",
        "shipping": "fas fa-truck",
        "shipping.ShippingZone": "fas fa-map",
        "returns": "fas fa-undo",
        "returns.ReturnRequest": "fas fa-undo-alt",
        "returns.ReturnItem": "fas fa-box-open",
    },
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",

    # UI options
    "related_modal_active": True,
    "custom_css": None,
    "custom_js": None,
    "use_google_fonts_cdn": True,
    "show_ui_builder": False,
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user": "collapsible",
    },
    "language_chooser": False,
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-success",
    "accent": "accent-teal",
    "navbar": "navbar-success navbar-dark",
    "no_navbar_border": False,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-success",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": True,
    "sidebar_nav_compact_style": True,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "default",
    "dark_mode_theme": None,
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-outline-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },
    "actions_sticky_top": True,
}

# ──────────────────────────────────────────────
# Production startup validation
# ──────────────────────────────────────────────
if not DEBUG:
    _required_prod_env = ['DJANGO_SECRET_KEY', 'DJANGO_ALLOWED_HOSTS', 'CORS_ALLOWED_ORIGINS']
    _missing = [v for v in _required_prod_env if not os.environ.get(v)]
    if _missing:
        raise RuntimeError(
            f'Missing required environment variables in production: {", ".join(_missing)}'
        )
    if PAYPAL_CLIENT_ID == '' or PAYPAL_CLIENT_SECRET == '':
        import logging
        logging.getLogger(__name__).warning(
            'PayPal credentials are not configured; PayPal payment flows will fail.'
        )