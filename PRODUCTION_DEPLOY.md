# Production Deployment Notes

This document captures the operational requirements for the production-ready e-commerce platform after the Phase 2 hardening pass.

---

## 1. Required services in production

| Service       | Purpose                                              | Notes                                                |
|---------------|------------------------------------------------------|------------------------------------------------------|
| Django (gunicorn) | API + admin                                       | Already containerised — see `solar_ecommerce/Dockerfile` |
| Postgres      | Primary database                                     | Set `DATABASE_URL=postgres://…`                       |
| Redis         | Cache + Celery broker                                | Required for queued emails & rate limits              |
| Celery worker | Out-of-band emails (order confirmation, refunds, low-stock) | Same image as the web app, different command   |
| Next.js       | Storefront (`solar_ecommerce_frontend`)              | Already containerised — see frontend `Dockerfile`     |
| Nginx         | TLS termination + reverse proxy                      | `nginx/nginx.ssl.conf` provided                       |

### Suggested `docker-compose` additions

```yaml
services:
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

  celery_worker:
    build: ./solar_ecommerce
    command: celery -A core worker -l info --concurrency=2
    env_file: ./solar_ecommerce/.env
    depends_on: [redis, db]
    restart: unless-stopped
```

---

## 2. Required environment variables

### Backend (`solar_ecommerce/.env`)

| Variable | Required | Purpose |
|---|:-:|---|
| `DJANGO_SECRET_KEY` | ✅ | App secret. Use a 50+ char random value. |
| `DJANGO_DEBUG` | ✅ | Must be `False` in production. |
| `DJANGO_ALLOWED_HOSTS` | ✅ | Comma-separated public hostnames. |
| `DJANGO_ADMIN_URL` | ✅ | Obscure admin path, e.g. `secure-ops/`. |
| `DATABASE_URL` | ✅ | `postgres://user:pass@host:5432/db` |
| `REDIS_URL` | ✅ | `redis://redis:6379/0` |
| `CORS_ALLOWED_ORIGINS` | ✅ | Storefront origin, e.g. `https://shop.example.com` |
| `EMAIL_HOST` / `_USER` / `_PASSWORD` / `_PORT` / `_USE_TLS` | ✅ | Transactional email (SES, Postmark, etc.) |
| `DEFAULT_FROM_EMAIL` | ✅ | Sender for order/refund/reset emails. |
| `STRIPE_SECRET_KEY` | ✅* | Server-side Stripe API key. |
| `STRIPE_PUBLISHABLE_KEY` | ✅* | Surfaced to the storefront via `/payments/stripe/create/`. |
| `STRIPE_WEBHOOK_SECRET` | ✅* | Required to verify `/api/webhooks/stripe/`. |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | ✅* | PayPal v2 REST. |
| `PAYPAL_MODE` | ✅* | `live` or `sandbox`. |
| `PAYPAL_WEBHOOK_ID` | ✅* | Required for `/api/webhooks/paypal/` to verify signatures. |
| `TAX_RATE_PERCENT` | optional | Defaults to 18 (GST). |
| `LOW_STOCK_THRESHOLD` | optional | Triggers admin notifications. |
| `USE_S3` | optional | `true` to switch storage to S3 via django-storages. |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_STORAGE_BUCKET_NAME` / `AWS_S3_REGION_NAME` | conditional | Required when `USE_S3=true`. |

`*` Required only if you enable that payment provider.

### Frontend (`solar_ecommerce_frontend/.env.production`)

| Variable | Required | Purpose |
|---|:-:|---|
| `NEXT_PUBLIC_API_BASE_URL` | ✅ | e.g. `https://api.example.com` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Canonical storefront URL. Used in sitemap, robots, and OpenGraph tags. |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | conditional | Required if PayPal is enabled. |

---

## 3. Webhook configuration

After deploying, register these webhook endpoints in the respective dashboards.

### Stripe
- URL: `https://api.example.com/api/webhooks/stripe/`
- Events:
  - `payment_intent.succeeded`
  - `charge.refunded`
  - `payment_intent.payment_failed` (optional, for analytics)
- Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

### PayPal
- URL: `https://api.example.com/api/webhooks/paypal/`
- Events:
  - `PAYMENT.CAPTURE.COMPLETED`
  - `PAYMENT.CAPTURE.REFUNDED`
- Copy the webhook ID into `PAYPAL_WEBHOOK_ID`.

---

## 4. Pre-launch checklist

- [ ] `DJANGO_DEBUG=False`, fresh `DJANGO_SECRET_KEY`, custom `DJANGO_ADMIN_URL`.
- [ ] HTTPS enforced via nginx (`nginx/nginx.ssl.conf`); HSTS enabled.
- [ ] `python manage.py migrate` and `collectstatic` run during deploy.
- [ ] Postgres + Redis backed up regularly.
- [ ] Celery worker running and reachable from the web container.
- [ ] Stripe + PayPal webhooks verified via the dashboard's "Send test event".
- [ ] Email deliverability validated (SPF/DKIM/DMARC).
- [ ] `NEXT_PUBLIC_SITE_URL` matches the deployed canonical origin (sitemap & SEO depend on it).
- [ ] At least one Django superuser exists with `is_staff=True` for `/admin` shell access.
- [ ] CSV import/export validated on a non-production sample before bulk catalogue updates.

---

## 5. Background jobs

Celery is wired with `task_always_eager=True` only when `DEBUG=True`. In production:

```bash
celery -A core worker -l info --concurrency=2
```

Tasks dispatched by the platform:

| Task | Trigger |
|---|---|
| `send_order_confirmation_email_task` | `Order.post_save` (created) |
| `send_order_status_update_email_task` | `Order.post_save` (status changed) |
| `send_refund_email_task` | Admin refund action / refund webhooks |
| `send_low_stock_email_task` | `Product.post_save` when stock crosses `LOW_STOCK_THRESHOLD` |

Add Celery Beat later if you need scheduled jobs (e.g., abandoned-cart reminders).

---

## 6. SEO surfaces shipped

- `/sitemap.xml` — generated from `NEXT_PUBLIC_SITE_URL` + product slugs (cached for 1 h).
- `/robots.txt` — disallows `/dashboard/`, `/admin/`, `/checkout/`, `/api/`.
- Per-page metadata via Next.js metadata API on the layout (`title.template`, OpenGraph, robots).
- Cookie consent banner (`solar.cookies.consent.v1`) for GDPR-style notices.

---

## 7. Admin shell

The new `/admin` route in the storefront is protected by `AdminGuard` (requires `is_staff`). It surfaces:

- Dashboard cards (revenue, orders, customers, low-stock, support inbox).
- Orders table with status filter and per-order detail (status update, tracking + ship, refund).
- Products table with one-click CSV export and CSV import (uses `multipart/form-data`).
- Customers list with search.
- Coupons CRUD.

For deeper CRUD (rich product editing, stock adjustments) continue to use the Django admin at `/<DJANGO_ADMIN_URL>`.
