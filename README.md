# Checkout USA

Full checkout stack for physical products sold in the US (USD), built with Next.js 15, Prisma/Postgres and Stripe (embedded Payment Element).

## Features

- **Admin** (`/admin`, protected by NextAuth login)
  - **Products** — CRUD for physical products (price, image, stock, active toggle, shipping flag)
  - **Orders** — list/search/filter orders, update status (pending/paid/shipped/delivered/...)
  - **Pixels** — configure Meta, TikTok, Google Ads/GA4 tracking IDs
  - **Dashboard** — revenue, order count, AOV, 30-day sales chart
- **Public checkout** (`/checkout/[slug]`) — collects customer + US shipping address, then confirms payment with Stripe's embedded Payment Element (card, wallets, etc. based on your Stripe Dashboard settings)
- **Stripe webhook** (`/api/stripe/webhook`) — the source of truth for marking orders paid/failed
- **Pixel firing** — PageView on checkout load, Purchase/CompletePayment fired once on the success page after the order is confirmed paid via polling (guards against double-firing with `purchaseEventSent`)

## 1. Setup

```bash
npm install
cp .env.example .env   # fill in the values below
```

Required env vars (see `.env.example`):

| Var | Where to get it |
|---|---|
| `DATABASE_URL` | Your Postgres connection string (Dokploy Postgres service, Neon, Supabase, etc.) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Public URL of the app (e.g. `https://checkout.yourdomain.com`) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Same page, publishable key |
| `STRIPE_WEBHOOK_SECRET` | Created in step 3 below |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Credentials for the first admin user (seed script) |

## 2. Database

```bash
npm run db:migrate   # creates tables (dev) — use `db:push` for a quick sync without migration history
npm run db:seed       # creates the admin user + a demo product
```

## 3. Stripe webhook

Register a webhook endpoint pointing to `https://yourdomain.com/api/stripe/webhook` listening to:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

Copy the generated signing secret into `STRIPE_WEBHOOK_SECRET`.

For local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## 4. Run

```bash
npm run dev
```

- Admin: `http://localhost:3000/admin/login`
- Demo checkout: `http://localhost:3000/checkout/demo-product`

## 5. Deploy (Dokploy)

1. Push this repo to Git and connect it in Dokploy as a Dockerfile-based app (the included `Dockerfile` produces a Next.js standalone build).
2. Add a Postgres service in Dokploy (or point `DATABASE_URL` at your own instance) and set all env vars from `.env.example` in the app's environment settings.
3. After the first deploy, run `npx prisma migrate deploy` and `npx prisma db seed` once (Dokploy's "Execute command" / shell on the running container, or a one-off deploy job) to create tables and the admin user.
4. Point the Stripe webhook at the deployed domain and update `STRIPE_WEBHOOK_SECRET`.

## Notes / next steps

- Shipping is currently a flat `$5.99` fee for products with `requiresShipping = true` (see `FLAT_SHIPPING_CENTS` in `create-payment-intent/route.ts`) — swap in real carrier rates when ready.
- Pixel firing is client-side only; add server-side Conversions API (Meta) / Events API (TikTok) / Measurement Protocol (GA4) calls in the webhook handler for better match rates — the `PixelSettings` model already stores the access tokens needed for that.
- Order numbers use a Postgres auto-increment column separate from the cuid `id`.
