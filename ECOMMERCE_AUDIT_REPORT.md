# E-Commerce Audit Report — Solar Project
> Audited: May 1, 2026 | Stack: Django REST + Next.js 14

---

## Current State Summary

| Layer | Status |
|---|---|
| Backend (Django) | ~75% complete |
| Frontend (Next.js) | ~65% complete |
| Payments | Partial (PayPal only) |
| Admin Panel | Basic Django admin only |
| SEO / Performance | Minimal |
| Notifications | Email only, plain text |
| Testing | Good coverage |

---

## WHAT EXISTS (Do Not Rebuild)

### Backend ✅
- JWT auth (register, login, logout, refresh, token blacklist)
- Password reset (forgot / reset via email token)
- Custom User model (email login, UUID PK, address book)
- Products: Category → Product → ProductImage (gallery, slug, SKU, stock, discount %, installation fee)
- Cart + CartItem (per-user, quantity validation, race-condition lock)
- Order lifecycle: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED → CANCELLED
- Order cancellation with stock restoration
- PayPal create + capture (v2 REST API, no deprecated SDK)
- Coupons: percentage + fixed, per-user limit, validity window, cap
- Reviews (one per user per product, 1–5 stars)
- Wishlist
- Contact messages + Newsletter subscriber
- WarrantyDocument on orders
- Transactional emails (order confirmation, status update) — plain text
- API docs (Swagger + ReDoc via drf-spectacular)
- Rate limiting on auth endpoints
- Input sanitisation middleware
- Security headers middleware
- CORS configured

### Frontend ✅
- Next.js 14, TypeScript, Tailwind CSS, Zustand, React Query, React Hook Form + Zod
- Auth flow: register, login, logout, forgot password, reset password
- Protected routes
- Product listing (search, filter by category, sort, pagination, debounced query)
- Product detail page (gallery, rating stars, add to cart, wishlist, related products, recently viewed)
- Cart page
- Checkout page (address picker, coupon input, PayPal integration)
- Dashboard: orders list, order detail, address management, change password
- Wishlist page
- Static site pages: home, about, services, projects, news, team, contact

---

## MISSING — MUST ADD FOR COMPLETE ECOMMERCE

---

### 1. PAYMENTS — Critical Gaps

#### 1.1 Stripe / Razorpay Integration (Backend + Frontend)
The Order model already has `CARD`, `UPI`, `NETBANKING` payment methods but **no implementation** exists.

**Backend — add `solar_ecommerce/apps/orders/services/stripe_client.py`:**
```python
import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_payment_intent(order):
    intent = stripe.PaymentIntent.create(
        amount=int(order.grand_total * 100),  # paise/cents
        currency=settings.STRIPE_CURRENCY,
        metadata={"order_id": str(order.id), "order_number": order.order_number},
    )
    return intent

def confirm_payment_intent(payment_intent_id):
    return stripe.PaymentIntent.retrieve(payment_intent_id)
```

**Backend — add views in `orders/views.py`:**
```python
@action(detail=True, methods=['post'], url_path='payments/stripe/create')
def stripe_create(self, request, pk=None):
    order = self.get_object()
    intent = create_payment_intent(order)
    order.payment_id = intent.id
    order.save(update_fields=['payment_id'])
    return Response({'client_secret': intent.client_secret})

@action(detail=True, methods=['post'], url_path='payments/stripe/confirm')
def stripe_confirm(self, request, pk=None):
    order = self.get_object()
    intent = confirm_payment_intent(order.payment_id)
    if intent.status == 'succeeded':
        order.payment_status = 'paid'
        order.paid_at = timezone.now()
        order.save(update_fields=['payment_status', 'paid_at'])
    return Response(OrderSerializer(order).data)
```

**Add to `requirements.txt`:**
```
stripe>=10.0
```

**Add to `core/settings.py`:**
```python
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')
STRIPE_CURRENCY = os.environ.get('STRIPE_CURRENCY', 'inr')
```

**Frontend — add `src/components/checkout/StripeCheckout.tsx`:**
```tsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);
```

**Add to `package.json`:**
```
"@stripe/stripe-js": "^4.0.0",
"@stripe/react-stripe-js": "^2.0.0"
```

#### 1.2 Payment Webhook Handler (Backend)
No webhook endpoint exists. Payments confirmed only by frontend — **insecure**.

**Add `solar_ecommerce/apps/orders/views.py`:**
```python
class PayPalWebhookView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        # Verify PayPal webhook signature header
        # Update order.payment_status = 'paid'
        # Trigger send_order_confirmation_email
        ...
```

```python
class StripeWebhookView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        sig = request.headers.get('Stripe-Signature')
        event = stripe.Webhook.construct_event(
            request.body, sig, settings.STRIPE_WEBHOOK_SECRET
        )
        if event['type'] == 'payment_intent.succeeded':
            ...
```

**Add to `core/urls.py`:**
```python
path('api/webhooks/paypal/', PayPalWebhookView.as_view()),
path('api/webhooks/stripe/', StripeWebhookView.as_view()),
```

#### 1.3 Refund Processing
`payment_status = 'refunded'` exists in the model but no refund endpoint/logic.

**Add to `orders/views.py`:**
```python
@action(detail=True, methods=['post'], url_path='refund', permission_classes=[IsAdminUser])
def refund(self, request, pk=None):
    order = self.get_object()
    # Call stripe.Refund.create or PayPal refund API
    order.payment_status = 'refunded'
    order.save()
    return Response(OrderSerializer(order).data)
```

---

### 2. BACKEND — Missing Models & Features

#### 2.1 Product Variants / Attributes
No way to have product variants (e.g., 500W / 540W / 600W panels, colour options).

**Add new model in `apps/products/models.py`:**
```python
class ProductAttribute(TimeStampedModel):
    name = models.CharField(max_length=100)  # e.g. "Wattage"

class ProductAttributeValue(TimeStampedModel):
    attribute = models.ForeignKey(ProductAttribute, on_delete=models.CASCADE, related_name='values')
    value = models.CharField(max_length=100)  # e.g. "540W"

class ProductVariant(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=50, unique=True)
    price_override = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)
    attributes = models.ManyToManyField(ProductAttributeValue)
    is_active = models.BooleanField(default=True)
```

#### 2.2 Inventory / Stock Alerts
No low-stock alerts for admins.

**Add `apps/products/signals.py`:**
```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings

LOW_STOCK_THRESHOLD = 5

@receiver(post_save, sender=Product)
def check_low_stock(sender, instance, **kwargs):
    if 0 < instance.stock <= LOW_STOCK_THRESHOLD:
        send_mail(
            subject=f'Low stock alert: {instance.name}',
            message=f'{instance.name} (SKU: {instance.sku}) has only {instance.stock} units left.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=True,
        )
```

**Add to `core/settings.py`:**
```python
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', '')
LOW_STOCK_THRESHOLD = int(os.environ.get('LOW_STOCK_THRESHOLD', '5'))
```

#### 2.3 Tax Calculation
No GST/VAT/tax logic. All totals are pre-tax.

**Add to `apps/orders/models.py`:**
```python
tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18)  # GST %
tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
```

**Update checkout service to calculate:**
```python
tax_amount = round(subtotal_after_discount * Decimal(str(order.tax_rate)) / 100, 2)
grand_total = subtotal_after_discount + installation_total + tax_amount
```

#### 2.4 Shipping Rates / Zones
No shipping cost logic. Shipping is always free.

**Add new app `apps/shipping/` or model in `apps/orders/models.py`:**
```python
class ShippingZone(TimeStampedModel):
    name = models.CharField(max_length=100)
    states = models.TextField(help_text='Comma-separated state names')
    rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    free_above = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estimated_days = models.PositiveSmallIntegerField(default=7)
```

**Add to `Order`:**
```python
shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
estimated_delivery_date = models.DateField(null=True, blank=True)
tracking_number = models.CharField(max_length=100, blank=True, default='')
tracking_url = models.URLField(blank=True, default='')
```

#### 2.5 Order Tracking Number
`tracking_number` and `tracking_url` fields are missing from the Order model (see above). Admin cannot enter courier tracking info.

#### 2.6 Return / RMA System
No return request workflow.

**Add `apps/returns/` app with:**
```python
class ReturnRequest(TimeStampedModel):
    class Status(models.TextChoices):
        REQUESTED = 'requested', 'Requested'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        COMPLETED = 'completed', 'Completed'

    order = models.ForeignKey('orders.Order', on_delete=models.PROTECT, related_name='returns')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    reason = models.TextField()
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.REQUESTED)
    admin_notes = models.TextField(blank=True)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
```

#### 2.7 Product Search Enhancement
Current search is basic Django ORM. No fuzzy search or relevance ranking.

**Add to `requirements.txt`:**
```
django-watson>=1.6
# OR
elasticsearch-dsl>=8.0
```

**Alternative (simpler):** Add PostgreSQL full-text search vectors:
```python
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank

Product.objects.annotate(
    rank=SearchRank(SearchVector('name', 'description', 'tags'), SearchQuery(q))
).filter(rank__gte=0.1).order_by('-rank')
```

#### 2.8 Admin Dashboard Stats API
No analytics endpoints for admin.

**Add to `apps/users/views.py`:**
```python
class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from apps.orders.models import Order
        today = timezone.now().date()
        return Response({
            'total_orders': Order.objects.count(),
            'orders_today': Order.objects.filter(created_at__date=today).count(),
            'revenue_total': Order.objects.filter(payment_status='paid').aggregate(Sum('grand_total'))['grand_total__sum'] or 0,
            'revenue_today': Order.objects.filter(payment_status='paid', paid_at__date=today).aggregate(Sum('grand_total'))['grand_total__sum'] or 0,
            'pending_orders': Order.objects.filter(status='pending').count(),
            'total_customers': User.objects.filter(is_staff=False).count(),
            'low_stock_products': Product.objects.filter(stock__lte=5, is_active=True).count(),
        })
```

#### 2.9 Bulk Inventory Management API
No CSV import/export for products.

**Add management command `apps/products/management/commands/import_products.py`:**
```python
class Command(BaseCommand):
    help = 'Import products from CSV'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str)

    def handle(self, *args, **options):
        import csv
        with open(options['csv_file']) as f:
            reader = csv.DictReader(f)
            for row in reader:
                Product.objects.update_or_create(sku=row['sku'], defaults=row)
```

**Add export endpoint:**
```python
@action(detail=False, methods=['get'], url_path='export', permission_classes=[IsAdminUser])
def export_csv(self, request):
    import csv
    from django.http import StreamingHttpResponse
    # Stream CSV of all products
```

#### 2.10 Social Auth (Google / GitHub OAuth)
No social login supported.

**Add to `requirements.txt`:**
```
social-auth-app-django>=5.4
```

**Add to `core/settings.py`:**
```python
AUTHENTICATION_BACKENDS = [
    'social_core.backends.google.GoogleOAuth2',
    'django.contrib.auth.backends.ModelBackend',
]
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = os.environ.get('GOOGLE_CLIENT_ID', '')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
```

---

### 3. FRONTEND — Missing Pages & Components

#### 3.1 Order Success / Confirmation Page
After checkout, user is redirected but there is **no dedicated order success page** showing order details, number, and next steps.

**Create `src/app/(shop)/orders/[id]/confirmation/page.tsx`:**
```tsx
'use client';
export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const { data: order } = useOrder(params.id);
  return (
    <div className="container max-w-2xl py-16 text-center">
      <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
      <h1>Order Confirmed!</h1>
      <p>Order #{order?.order_number}</p>
      <p>We'll send a confirmation to {order?.user_email}</p>
      <Link href="/dashboard/orders">View my orders</Link>
    </div>
  );
}
```

#### 3.2 Admin Dashboard (Frontend)
No custom admin frontend. Admins must use Django admin. Missing:
- Order management table with status update
- Product CRUD UI (create, edit, delete, upload images)
- Customer list
- Analytics charts (revenue, orders over time)
- Coupon management UI
- Low stock alerts UI

**Create `src/app/admin/` directory with:**
```
src/app/admin/
  layout.tsx          (admin-only protected route)
  page.tsx            (stats dashboard)
  orders/
    page.tsx          (orders table, filters, status update)
    [id]/page.tsx     (order detail with status update)
  products/
    page.tsx          (product table)
    new/page.tsx      (create product form)
    [slug]/edit/page.tsx (edit product)
  customers/
    page.tsx          (customer list)
  coupons/
    page.tsx          (coupon list + create)
```

#### 3.3 Search Results Page
Products page has search but no dedicated `/search?q=` results page or search bar in header.

**Add to `Header.tsx`:**
```tsx
<form onSubmit={handleSearch}>
  <Input placeholder="Search solar products..." value={query} onChange={...} />
</form>
```

**Create `src/app/(shop)/search/page.tsx`** — redirect to `/products?search=`.

#### 3.4 Compare Products Feature
No way to compare 2–4 products side by side (common in solar/tech ecommerce).

**Create `src/app/(shop)/compare/page.tsx`:**
```tsx
// Show selected products in a table comparing: price, capacity, warranty, rating, installation
```

**Add `src/store/compare.ts`** (Zustand store, max 4 products).

#### 3.5 Product Filter — Price Range Slider
Current filters: category + sort only. Missing price range slider.

**Add to products page sidebar:**
```tsx
<PriceRangeSlider min={0} max={500000} value={[minPrice, maxPrice]} onChange={...} />
```

**Backend already supports:** `?price_min=&price_max=` — just needs to be added to `filterset_fields`.

#### 3.6 Checkout — Missing Payment Methods UI
Checkout shows only `paypal` and `cod`. The backend supports `upi`, `card`, `netbanking` but frontend has no UI for them.

**Update `src/app/(shop)/checkout/page.tsx`** to add Stripe card element and UPI options.

#### 3.7 Tax Display in Cart / Checkout
No GST/tax line shown anywhere in cart or checkout totals.

#### 3.8 Shipping Cost Display
No shipping cost line in cart or checkout. Users don't know if shipping is free or paid.

#### 3.9 Order Tracking Page
No order tracking UI showing the shipment status with timeline.

**Create `src/app/dashboard/orders/[id]/tracking/page.tsx`:**
```tsx
// Timeline: Ordered → Confirmed → Processing → Shipped → Delivered
// Show tracking number and courier link
```

#### 3.10 Return Request UI
No UI for requesting a return/refund.

**Create `src/app/dashboard/orders/[id]/return/page.tsx`:**
```tsx
// Form: select items, reason, submit return request
```

#### 3.11 Product Reviews — Images
Reviews currently accept rating + text only. No photo uploads.

**Add to Review model:**
```python
class ReviewImage(TimeStampedModel):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='reviews/')
```

#### 3.12 Notification / Toast System
No global toast/notification for actions like "Added to cart", "Order placed", error messages. (Lucide icons imported but no toast component.)

**Add `src/components/ui/Toast.tsx`** using a library or custom implementation:
```
npm install sonner
```

**Wrap in `src/app/layout.tsx`:**
```tsx
import { Toaster } from 'sonner';
<Toaster position="bottom-right" />
```

#### 3.13 Empty States
Pages like wishlist, orders, cart need proper empty-state illustrations, not just text.

#### 3.14 Loading Skeletons
Product listing uses no skeleton loaders — just blank space while loading.

**Add `src/components/ui/Skeleton.tsx`:**
```tsx
export function ProductCardSkeleton() {
  return <div className="animate-pulse rounded-2xl bg-slate-100 h-80 w-full" />;
}
```

#### 3.15 Breadcrumbs
Product detail has a nav breadcrumb but it's inconsistent. No breadcrumb on checkout, dashboard pages.

#### 3.16 Cookie Consent Banner
No GDPR/privacy cookie consent banner.

**Create `src/components/ui/CookieBanner.tsx`.**

---

### 4. SEO & PERFORMANCE

#### 4.1 Next.js Metadata API
No `generateMetadata` on product detail page — critical for SEO.

**Add to `src/app/(shop)/products/[slug]/page.tsx`:**
```tsx
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await fetchProductBySlug(params.slug);
  return {
    title: `${product.name} | Solar Store`,
    description: product.description.slice(0, 155),
    openGraph: {
      images: [product.images[0]?.image],
    },
  };
}
```

#### 4.2 Server-Side Rendering for Product Pages
All product pages are `'use client'` — they cannot be crawled with content by search engines.

**Refactor `src/app/(shop)/products/[slug]/page.tsx`** to use `async` server component with fetch at the top level (use `unstable_cache` or Next.js fetch caching).

#### 4.3 Sitemap
No `sitemap.xml` generated.

**Create `src/app/sitemap.ts`:**
```ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchAllProducts();
  return [
    { url: 'https://yourdomain.com', lastModified: new Date() },
    { url: 'https://yourdomain.com/products', lastModified: new Date() },
    ...products.map(p => ({
      url: `https://yourdomain.com/products/${p.slug}`,
      lastModified: p.updated_at,
    })),
  ];
}
```

#### 4.4 robots.txt
**Create `src/app/robots.ts`:**
```ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard/', '/admin/', '/checkout/'] },
    sitemap: 'https://yourdomain.com/sitemap.xml',
  };
}
```

#### 4.5 Image Optimization
Product images served directly from Django's `/media/` — no CDN, no WebP conversion, no lazy loading with blur placeholder.

**Configure in `next.config.mjs`:**
```js
images: {
  remotePatterns: [{ hostname: 'your-api-domain.com' }],
  formats: ['image/avif', 'image/webp'],
}
```

**Replace `<img>` tags with `<Image>` from `next/image`.**

#### 4.6 Structured Data (JSON-LD)
No schema.org markup for products (enables rich snippets in Google).

**Add to product detail page:**
```tsx
<script type="application/ld+json">{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "offers": { "@type": "Offer", "price": product.discounted_price, "priceCurrency": "INR" },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": product.average_rating }
})}</script>
```

---

### 5. SECURITY GAPS

#### 5.1 Stripe/PayPal Webhook Signature Verification
Currently frontend-driven payment confirmation — a user could manually call the capture endpoint without actually paying. **Webhook signature verification is mandatory.**

#### 5.2 Rate Limiting — Missing on Non-Auth Endpoints
`AuthRateThrottle` applied only to auth routes. Cart, checkout, review creation need throttling too.

**Add to `core/settings.py`:**
```python
REST_FRAMEWORK = {
    ...
    'DEFAULT_THROTTLE_CLASSES': ['rest_framework.throttling.AnonRateThrottle'],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'auth': '10/min',
    },
}
```

#### 5.3 File Upload Validation
ProductImage upload only checks `parsers.MultiPartParser`. No server-side validation of file type, size, or malicious content.

**Add to `ProductImageSerializer`:**
```python
def validate_image(self, value):
    max_size = 5 * 1024 * 1024  # 5 MB
    if value.size > max_size:
        raise serializers.ValidationError("Image must be ≤ 5 MB.")
    valid_types = ['image/jpeg', 'image/png', 'image/webp']
    if value.content_type not in valid_types:
        raise serializers.ValidationError("Only JPEG, PNG, or WebP images are accepted.")
    return value
```

#### 5.4 HTTPS / SSL Enforcement in Production
Nginx config exists but no `SECURE_SSL_REDIRECT = True` or `HSTS` headers in Django settings for production.

**Add to `core/settings.py` (production block):**
```python
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
```

#### 5.5 Admin URL Obfuscation
Admin is at `/admin/` — predictable. Move to a custom path.

**Change in `core/urls.py`:**
```python
path(os.environ.get('DJANGO_ADMIN_URL', 'secret-admin/'), admin.site.urls),
```

---

### 6. EMAILS — HTML Templates

Current emails are plain text. Professional ecommerce needs HTML emails.

**Add `django-anymail` + email templates:**
```
anymail[sendgrid]>=10.0  # or mailgun, ses
```

**Create `apps/orders/templates/orders/emails/` directory with:**
- `order_confirmation.html`
- `order_status_update.html`  
- `password_reset.html`
- `low_stock_alert.html`

**Or use a service like Resend:**
```
resend>=2.0
```

---

### 7. MISSING BACKEND SETTINGS

Add to `core/settings.py` or `.env`:

```python
# Tax
TAX_RATE_PERCENT = Decimal(os.environ.get('TAX_RATE_PERCENT', '18'))

# Stripe
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')
STRIPE_CURRENCY = os.environ.get('STRIPE_CURRENCY', 'inr')

# Admin alerts
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', '')
LOW_STOCK_THRESHOLD = int(os.environ.get('LOW_STOCK_THRESHOLD', '5'))

# Email (anymail / sendgrid)
ANYMAIL = {'SENDGRID_API_KEY': os.environ.get('SENDGRID_API_KEY', '')}
EMAIL_BACKEND = 'anymail.backends.sendgrid.EmailBackend'

# CDN / Media in production
USE_S3 = env_bool('USE_S3', False)
if USE_S3:
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
```

---

### 8. FILE STORAGE — Media in Production

Currently media files stored on local disk — **they will be lost on container restart/redeploy.**

**Add to `requirements.txt`:**
```
django-storages[s3]>=1.14
boto3>=1.34
```

**Configure S3 (or DigitalOcean Spaces) in settings** (see section 7 above).

---

### 9. CACHING

No caching layer. Every product list request hits the database.

**Add Redis caching:**
```
django-redis>=5.4
```

```python
# core/settings.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.environ.get('REDIS_URL', 'redis://localhost:6379/1'),
    }
}

# Cache product list for 5 minutes
from django.views.decorators.cache import cache_page
# Or use @method_decorator(cache_page(300)) on list views
```

---

### 10. BACKGROUND TASKS / ASYNC

No task queue. All operations (emails, stock alerts) run synchronously in the request cycle.

**Add Celery + Redis:**
```
celery>=5.4
django-celery-beat>=2.6  # scheduled tasks
```

**Move these to Celery tasks:**
- `send_order_confirmation_email`
- `send_order_status_update_email`
- Low stock alert emails
- Coupon expiry cleanup

---

## PRIORITY ORDER (Recommended Implementation Sequence)

| Priority | Feature | Effort |
|---|---|---|
| 🔴 P0 | Payment webhook verification (Stripe/PayPal) | Medium |
| 🔴 P0 | HTTPS/SSL Django security settings | Small |
| 🔴 P0 | File upload validation | Small |
| 🔴 P0 | Order confirmation page (frontend) | Small |
| 🟠 P1 | Stripe card payment integration | Large |
| 🟠 P1 | Tax calculation (GST) | Medium |
| 🟠 P1 | Shipping cost + tracking number | Medium |
| 🟠 P1 | Admin dashboard frontend | Large |
| 🟠 P1 | HTML email templates | Medium |
| 🟡 P2 | S3/Spaces media storage | Medium |
| 🟡 P2 | Redis caching | Medium |
| 🟡 P2 | Product variants | Large |
| 🟡 P2 | Return/RMA system | Large |
| 🟡 P2 | SEO (metadata, sitemap, JSON-LD) | Medium |
| 🟡 P2 | Toast notification system | Small |
| 🟢 P3 | Celery background tasks | Medium |
| 🟢 P3 | Social auth (Google) | Medium |
| 🟢 P3 | Product compare feature | Medium |
| 🟢 P3 | Full-text search (PostgreSQL) | Medium |
| 🟢 P3 | Cookie consent banner | Small |

---

## NEW FILES TO CREATE

### Backend
```
solar_ecommerce/
  apps/
    orders/
      services/
        stripe_client.py          ← NEW
      templates/
        orders/emails/
          order_confirmation.html ← NEW
          order_status_update.html← NEW
    returns/                      ← NEW APP
      __init__.py
      admin.py
      apps.py
      models.py
      serializers.py
      urls.py
      views.py
      migrations/
    shipping/                     ← NEW APP (or add to orders)
      __init__.py
      models.py
  core/
    celery.py                     ← NEW
```

### Frontend
```
solar_ecommerce_frontend/src/
  app/
    (shop)/
      orders/[id]/
        confirmation/page.tsx     ← NEW
      search/page.tsx             ← NEW
      compare/page.tsx            ← NEW
    admin/                        ← NEW (entire directory)
      layout.tsx
      page.tsx
      orders/page.tsx
      products/page.tsx
      products/new/page.tsx
      coupons/page.tsx
      customers/page.tsx
    dashboard/
      orders/[id]/
        tracking/page.tsx         ← NEW
        return/page.tsx           ← NEW
    sitemap.ts                    ← NEW
    robots.ts                     ← NEW
  components/
    checkout/
      StripeCheckout.tsx          ← NEW
    ui/
      Toast.tsx                   ← NEW
      Skeleton.tsx                ← NEW
      PriceRangeSlider.tsx        ← NEW
      CookieBanner.tsx            ← NEW
      Timeline.tsx                ← NEW (for order tracking)
  store/
    compare.ts                    ← NEW
```

---

## ENVIRONMENT VARIABLES CHECKLIST

Add these to your `.env` / Docker secrets:

```env
# Existing (verify set)
DJANGO_SECRET_KEY=
DJANGO_ALLOWED_HOSTS=
DJANGO_DEBUG=false
DATABASE_URL=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_BASE_URL=https://api-m.paypal.com
FRONTEND_URL=

# New — Add these
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CURRENCY=inr

ADMIN_EMAIL=
LOW_STOCK_THRESHOLD=5
TAX_RATE_PERCENT=18

SENDGRID_API_KEY=
# OR
RESEND_API_KEY=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
AWS_S3_REGION_NAME=ap-south-1

REDIS_URL=redis://redis:6379/1

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NEXT_PUBLIC_STRIPE_KEY=
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
NEXT_PUBLIC_API_BASE_URL=
```
