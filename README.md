# SaaS Starter Kit — Next.js Dashboard / Admin Starter

A production-ready starter kit for building a SaaS product: landing page,
pricing, real auth, a database-backed dashboard with stats / revenue chart /
customer table, settings that persist, and billing wired for **Polar**
(merchant of record) including a verified webhook that activates plans.
Clone it, brand it, launch it.

**Stack:** Next.js 14 (App Router) · TypeScript (strict) · Tailwind CSS 3 ·
React 18 · Auth.js (NextAuth v5) · Prisma · SQLite by default (Postgres for
production) · bcryptjs.

## Quick start

```bash
npm install
cp .env.example .env          # Prisma's CLI reads .env, not .env.local
# In .env, set AUTH_SECRET to a long random value: openssl rand -base64 32
npm run db:setup              # creates the database and seeds sample data
npm run dev                   # http://localhost:3000
```

Sign up at `/auth/signup` — your account is created in the database and
you are logged straight into `/dashboard`. There is no demo login.

Other commands: `npm run build`, `npm start`, `npm run typecheck`,
`npm run db:push`, `npm run db:seed`.

## What is included

| Area | Files |
|---|---|
| Landing page | `src/app/page.tsx` — hero, stats, feature grid |
| Pricing page | `src/app/pricing/page.tsx` — Free / Starter $29 / Pro $49, buys via Polar |
| Docs | `src/app/docs/page.tsx` |
| Auth | `src/auth.ts` (Auth.js config), `src/app/auth/login`, `src/app/auth/signup`, `src/lib/auth.ts`, `src/middleware.ts` |
| Database | `prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/db.ts` |
| Dashboard | `src/app/dashboard/` — overview (from the DB), billing, settings (persisted); sidebar layout |
| Billing | `src/lib/polar.ts`, `src/app/api/checkout/route.ts`, `src/app/api/webhooks/polar/route.ts` |
| UI kit | `src/components/ui.tsx` — Button, Card, Badge, SectionHeading |

## Auth

Auth.js (NextAuth v5) with a **credentials provider** — no external
account signup is needed. Signup creates a `User` row; the password is
stored as a **bcrypt hash** (12 rounds), never in plain text. Login
checks the hash and issues a signed JWT session (`AUTH_SECRET`).

Sessions are JWT, deliberately: Auth.js's Credentials provider only
supports JWT sessions — database sessions are incompatible with it
(Auth.js docs). Users, subscriptions and all dashboard data still live
in the database; only the session token itself is a signed JWT. The
Prisma adapter is wired so the Auth.js tables exist for future OAuth
providers. `src/middleware.ts` validates the JWT on every `/dashboard`
request; the dashboard layout re-checks the session server-side.

There is no demo user and no demo login anywhere in this kit.

## Database

Prisma. **SQLite by default** — `DATABASE_URL="file:./dev.db"` in `.env`,
created by `npm run db:setup`. No cloud account needed to run it locally.

Models: `User`, `Customer`, `Subscription`, `MonthlyRevenue`, `Setting`,
plus the Auth.js `Account` / `Session` / `VerificationToken` tables.
The dashboard reads everything from the database: stat cards are
computed from customer and revenue rows, the revenue chart from
`MonthlyRevenue`, the customers table from `Customer`, and settings
from the single `Setting` row (`POST /api/settings` persists it).

**Seed data is fictional sample data** — 5 sample customers, 12 months
of sample revenue, default workspace settings — so a buyer sees the
dashboard working immediately. It is labelled as sample data in
`prisma/seed.ts` and in the dashboard copy. Replace it with real data
before launch (`prisma db seed` is idempotent — it upserts).

**Production Postgres (Supabase is the recommended free host):**

1. Create a Supabase project (free tier) and copy its Postgres
   connection string (use the pooled / transaction-mode string for
   serverless hosts like Vercel).
2. Copy `prisma/schema.postgres.prisma` over `prisma/schema.prisma`
   (the models are identical — only the `provider` line changes).
3. In `.env`, set `DATABASE_URL` to the Postgres connection string.
4. Run `npx prisma generate && npm run db:push && npm run db:seed`.
5. On Vercel, set the same `DATABASE_URL` env var — the SQLite file
   does not persist on serverless hosts, so do not use SQLite there.

## Billing — Polar (primary)

Why Polar: **Stripe and PayPal do not accept sellers in Bangladesh.**
Polar is a merchant of record — it is the legal seller, handles
VAT/sales tax, and pays out to a Bangladeshi bank account
(5% + $0.50 per sale; payouts run through Stripe Connect — no
Payoneer option appeared when the account was set up on 2026-11-16).
No credentials are
hard-coded anywhere; everything comes from env vars.

**How David connects Polar later (exact steps):**

1. Create an account at [polar.sh](https://polar.sh) and create an
   organization.
2. In Polar, create two products: **Starter ($29 one-time)** and **Pro ($49 one-time)**.
   Copy each product ID. (Done 2026-11-16 for this kit — see polar-setup.md.)
3. In Polar settings, create an **access token** and copy it.
4. In this project, copy `.env.example` to `.env` and set:
   ```
   POLAR_ACCESS_TOKEN=<token from step 3>
   POLAR_ORGANIZATION_ID=<organization id>
   POLAR_PRODUCT_ID_STARTER=<Starter product id>
   POLAR_PRODUCT_ID_PRO=<Pro product id>
   NEXT_PUBLIC_APP_URL=<your production URL, e.g. https://yourapp.com>
   ```
5. Restart the app. Click **Buy Starter / Buy Pro** on `/pricing` (or
   Upgrade on `/dashboard/billing`) — the buyer is sent to Polar checkout.
   Without these vars, checkout returns a clear configuration error
   instead of failing silently (try it: it is the designed behaviour).
6. In Polar, set the webhook URL to
   `https://your-domain.com/api/webhooks/polar` and copy the webhook
   secret into `POLAR_WEBHOOK_SECRET`.

**Webhook — implemented** (`src/app/api/webhooks/polar/route.ts`):
the Svix signature is verified (HMAC-SHA256 over
`<webhook-id>.<timestamp>.<raw body>`, 5-minute replay window) and
returns 401 on a bad signature. On `order.created`,
`subscription.created` / `subscription.active` / `subscription.updated`
it looks the buyer up by email and activates/upgrades their plan in the
database (creating/updating the `Subscription` row); on
`subscription.canceled` / `subscription.revoked` it marks the
subscription cancelled/revoked and downgrades the user to the free plan.
Unknown event types and unknown product IDs are acknowledged and
ignored. If no account exists for the buyer's email, the event is
acknowledged but nothing is activated (an account must exist first).

## Billing — Paddle (fallback)

Paddle is also a merchant of record and lists Bangladesh as supported
(5% + $0.50 per sale). Use it only if Polar rejects your product
(Polar reviews software products and can decline without a reason).

Steps: create a Paddle account and product, add a
`src/lib/paddle.ts` mirroring `src/lib/polar.ts` (same
`createCheckout(plan)` shape), point `/api/checkout` at it when
`POLAR_ACCESS_TOKEN` is absent, and set `PADDLE_API_KEY` /
`PADDLE_PRODUCT_ID_PRO` in `.env`. Do **not** use Gumroad as the
sole payout channel (its Bangladesh bank-payout status is conflicting)
and do **not** use Lemon Squeezy without a fallback (it is being moved
onto Stripe's merchant-of-record service, which does not accept
Bangladesh sellers). Do not open a PayPal/Stripe account with a foreign
address, and do not form a US LLC just to get Stripe without
professional advice.

## Deploy

- **Vercel (recommended):** import the repo, set the same env vars,
  deploy. Set `NEXT_PUBLIC_APP_URL` to the production domain. Use
  Postgres (Supabase) — see § Database.
- **Any Node host:** `npm run build && npm start` (Node ≥ 18.17).

## Customising for your buyers

- Brand colour: change the `brand` scale in `tailwind.config.ts`.
- Name: search for `SaaS Starter` and replace; set
  `NEXT_PUBLIC_APP_NAME` in `.env`.
- Plans/prices: edit `PLANS` in `src/lib/polar.ts` and the tiers in
  `src/app/pricing/page.tsx`.
- Data: seed data lives in `prisma/seed.ts` — delete or replace it;
  the dashboard queries the database, so no code change is needed.
- Auth providers: add OAuth providers in `src/auth.ts` (the Prisma
  adapter tables already exist).

## What is still missing before it can be listed for sale

1. **Polar account + products** — create them and set the env vars
   (§ Billing). No accounts were created for this kit.
2. **Buyer-facing polish for the listing** — screenshots / a short demo
   video, a license file (see `LICENSE.md` — add one before selling),
   and a support email address. See `DEMO_PLAN.md`.
3. **A production database** — run the Postgres steps in § Database
   before deploying (SQLite is for local dev only).

Auth, the database, the Polar webhook and settings persistence are done.

## Honest limits

- No income is guaranteed; the median digital product earns little.
  This kit is a starting point, not a business.
- Checkout and the webhook were verified only as far as the
  configuration / signature paths (no Polar account exists, so no real
  payment was tested — see the verification notes in the delivery).
- The seed dashboard figures are fictional sample data, labelled as
  such; they are not real revenue.
