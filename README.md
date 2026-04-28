# Eco Planet Solar — Full-Stack eCommerce

Production-ready solar eCommerce platform: Django + DRF backend with JWT auth,
PayPal payments, and a Next.js 14 (App Router) storefront.

## Layout

```
solar_ecommerce/            Django 6 + DRF API (port 8000)
solar_ecommerce_frontend/   Next.js 14 storefront (port 3000)
docker-compose.yml          Local stack (Nginx + backend + frontend)
nginx/                      Reverse proxy configs (HTTP / SSL)
```

## Feature highlights

- Email-based JWT auth with refresh-rotation + blacklist; password reset & change
- Saved addresses (CRUD), cart, wishlist, coupon validation
- Checkout with PayPal Smart Buttons (sandbox/live) and Cash on Delivery
- Order tracking timeline, customer self-cancel for pending orders
- Product catalogue with search/sort/category filter, reviews, recently viewed
- Admin dashboard endpoint with order/product/customer stats
- Throttled auth endpoints, generic forgot-password response (no enumeration)
- 131-test backend suite (`pytest`)

## Quick start (development)

```bash
# Backend
cd solar_ecommerce
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
DJANGO_DEBUG=true DJANGO_SECRET_KEY=dev-not-secret \
    python manage.py migrate
DJANGO_DEBUG=true DJANGO_SECRET_KEY=dev-not-secret \
    python manage.py runserver

# Frontend (in a new shell)
cd solar_ecommerce_frontend
cp .env.local.example .env.local      # adjust if needed
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Configuration

All required environment variables — Django, email, PayPal, frontend —
are documented in [`solar_ecommerce/.env.example`](solar_ecommerce/.env.example)
and [`solar_ecommerce_frontend/.env.local.example`](solar_ecommerce_frontend/.env.local.example).

For PayPal:

1. Create a sandbox app at <https://developer.paypal.com/dashboard/>.
2. Set `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` on the backend.
3. Set `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (same client id) on the frontend.

## Tests

```bash
cd solar_ecommerce
pytest -q
```

## Deployment

See [`DEPLOY_DIGITALOCEAN.md`](DEPLOY_DIGITALOCEAN.md) and
[`DEPLOYMENT.md`](DEPLOYMENT.md) for the full Docker / Nginx / SSL workflow.
