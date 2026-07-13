# ── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: Build the Next.js app ──────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (injected at build via docker-compose args)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ARG NEXT_PUBLIC_PAYPAL_CLIENT_ID
ENV NEXT_PUBLIC_PAYPAL_CLIENT_ID=${NEXT_PUBLIC_PAYPAL_CLIENT_ID}
ARG NEXT_PUBLIC_PAYPAL_CURRENCY
ENV NEXT_PUBLIC_PAYPAL_CURRENCY=${NEXT_PUBLIC_PAYPAL_CURRENCY}
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}

RUN npm run build

# ── Stage 3: Production runtime ──────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy public dir only if it exists (it may be empty)
RUN mkdir -p ./public
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
