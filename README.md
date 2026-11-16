# SaaS Starter Kit — Next.js Dashboard / Admin Starter

A production-ready starter kit for building a SaaS product: landing page,
pricing, real auth, a database-backed dashboard with stats / revenue chart /
customer table, settings that persist, and billing wired for **Polar**
(merchant of record) **or Stripe**, each with a verified webhook that
activates plans. Clone it, brand it, launch it.

**Stack:** Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS 3 ·
React 19 · Auth.js (NextAuth v5) · Prisma · PostgreSQL · bcryptjs.

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

Setup time, measured 2026-11-16 from a clean clone on this machine:
**59 seconds** from `git clone` to a responding dev server with a cold
package cache (30 seconds with a warm cache) — `npm install`,
`npm run db:setup`, `npm run dev`. Your machine and network will vary;
the point is that there is no long build step before you can see it run.

Other commands: `npm run build`, `npm start`, `npm run typecheck`,
`npm run db:push`, `npm run db:seed`.

## What is included

| Area | Files |
|---|---|
| Landing page | `src/app/page.tsx` — hero, stats, feature grid, waitlist form, honest testimonials section (empty until the first real buyer) |
| Waitlist | `src/app/api/waitlist/route.ts`, `src/components/waitlist-form.tsx`, `WaitlistSignup` model — email capture on the landing page, listed on the dashboard; the kit never emails signups itself |
| Pricing page | `src/app/pricing/page.tsx` — Free / Starter $29 / Pro $49, buys via Polar or Stripe |
| Docs | `src/app/docs/page.tsx` |
| Blog | `src/app/blog/` — MDX blog (`src/content/blog/*.mdx`, rendered with `next-mdx-remote`), 3 starter posts |
| Changelog | `src/app/changelog/page.tsx` — real releases only, dated as shipped |
| Showcase | `src/app/showcase/page.tsx`, `SHOWCASE.md` — public leaderboard, honest empty state until the first buyer ships; listings are manual and reviewed |
| SEO | `src/app/layout.tsx` (metadata + Open Graph), `src/app/sitemap.ts`, `src/app/robots.ts`, `src/lib/site.ts` (canonical URL) |
| Agent rules | `AGENTS.md` + `.cursor/rules/repo.mdc` — setup, layout, and the hard lessons (session pooler, cookie name, force-dynamic auth pages) |
| Lite version | `lite` branch — landing + auth + dashboard only, no billing, MIT license (see below) |
| Auth | `src/auth.ts` (Auth.js config), `src/app/auth/login`, `src/app/auth/signup`, `src/app/auth/reset-password`, `src/lib/auth.ts`, `src/proxy.ts` |
| Email | `src/lib/email.ts` — Resend: verification, password reset, welcome, magic links |
| Database | `prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/db.ts` |
| Dashboard | `src/app/dashboard/` — overview (from the DB: add/delete customers, CSV export, waitlist list), billing, settings (persisted); sidebar layout |
| Billing | `src/lib/polar.ts` + `src/lib/stripe.ts`, `src/app/api/checkout/route.ts`, `src/app/api/webhooks/polar/route.ts`, `src/app/api/webhooks/stripe/route.ts` |
| UI kit | `src/components/ui.tsx` — Button, Card, Badge, SectionHeading |

## Auth

Auth.js (NextAuth v5) with **three sign-in options** (see `src/auth.ts`):

1. **Email + password (credentials)** — always on, no external account
   signup needed. Signup creates a `User` row; the password is stored
   as a **bcrypt hash** (12 rounds), never in plain text. Login checks
   the hash and issues a signed JWT session (`AUTH_SECRET`).
2. **Google** — OAuth via the seller's own Google Cloud client
   (`AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`). The button only appears
   when both are set; otherwise the provider is not registered.
3. **Magic link** — a sign-in link emailed via Resend
   (`RESEND_API_KEY`). The link only appears when Resend is
   configured. It needs the Prisma adapter (tokens live in
   `VerificationToken`); sessions stay JWT.

Sessions are JWT, deliberately: Auth.js's Credentials provider only
supports JWT sessions — database sessions are incompatible with it
(Auth.js docs). Users, subscriptions and all dashboard data still live
in the database; only the session token itself is a signed JWT. The
Prisma adapter is wired so the Auth.js tables exist for the OAuth and
magic-link providers. `src/proxy.ts` (Next.js 16 renamed the old
`middleware.ts` convention to `proxy`) validates the JWT on every
`/dashboard` request; the dashboard layout re-checks the session
server-side.

**Email verification:** signup sends a verification link (24h, single
use). Login is NOT blocked while the email is unverified — the link
only records the verification. **Password reset** is built in
(`/auth/reset-password`, 1h single-use token, hashed before storage);
the request endpoint never reveals whether an account exists.

**Account linking — the safe default is kept on purpose.** A Google
sign-in whose email already belongs to a password account is rejected
(`OAuthAccountNotLinked`) — Google does NOT silently take over that
account. A Google-created account has no password (`passwordHash` is
null) and cannot log in with credentials until a password is set via
the reset flow. Only enable `allowDangerousEmailAccountLinking` in
`src/auth.ts` if you understand the trade-off (see the comment there).

There is no demo user and no demo login anywhere in this kit.

## Email

Transactional email via **Resend** (`src/lib/email.ts`) — one key,
`RESEND_API_KEY`, powers the magic-link provider, the signup
verification email, the welcome email and password reset
(`EMAIL_FROM` sets the sender). If the key is missing, auth keeps
working and the email steps report "not configured" instead of
crashing.

Resend's free tier covers 100 emails/day. Until you verify your own
sending domain in Resend, mail goes from `onboarding@resend.dev` and
Resend only delivers to your own Resend account email — verify a
domain before launch or your users' verification and reset emails
will not arrive.

## Database

Prisma with **PostgreSQL**. Set `DATABASE_URL` to your Postgres
connection string in `.env`, then `npx prisma generate` and
`npm run db:push` (or `npm run db:setup` for push + seed). Supabase
is the recommended free host — see the production steps below.

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
   connection string. For serverless hosts like Vercel, use the
   **session pooler** (port 5432) — the transaction pooler (6543)
   breaks Prisma at runtime (`prepared statement already exists`).
2. In `.env`, set `DATABASE_URL` to the Postgres connection string.
3. Run `npx prisma generate && npm run db:push && npm run db:seed`.
4. On Vercel, set the same `DATABASE_URL` env var.

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

## Billing — Stripe (second option)

Stripe is offered next to Polar because most SaaS buyers already have
a Stripe account — if they want Stripe, they should not have to rewire
billing themselves. The two options differ: Polar is a merchant of
record (it is the legal seller and handles tax); Stripe is a payment
processor (the seller is the legal seller and Stripe pays out to the
seller's own bank). The buyer picks on `/pricing` or
`/dashboard/billing`; Polar is the default.

No Stripe products need pre-creating: checkout (`src/lib/stripe.ts`)
uses inline `price_data` (amount + currency + plan name) and carries
the plan in the Checkout Session metadata. Only two keys are needed:

```
STRIPE_SECRET_KEY=<from the Stripe dashboard, Developers → API keys>
STRIPE_WEBHOOK_SECRET=<from the Stripe dashboard, Developers → Webhooks → the endpoint secret>
```

Set the webhook URL in Stripe to
`https://your-domain.com/api/webhooks/stripe` and listen for
`checkout.session.completed` (and `charge.refunded`).
Without the keys, Stripe checkout returns a clear configuration error
and Polar stays the only option.

**Webhook — implemented** (`src/app/api/webhooks/stripe/route.ts`):
the Stripe signature is verified by hand with node:crypto
(HMAC-SHA256 over `<timestamp>.<raw body>`, 5-minute replay window)
and returns 401 on a bad signature. On
`checkout.session.completed` with `payment_status: paid` it looks the
buyer up by the session's customer email, reads the plan from the
session metadata and activates it in the database; on
`charge.refunded` it marks the subscription cancelled and downgrades
the user to the free plan. Unknown events and sessions with no plan
in metadata are acknowledged and ignored.

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

## Blog, changelog and SEO

- **Blog** — `/blog` is an MDX blog. Posts live in
  `src/content/blog/*.mdx` with their titles/dates in `src/lib/blog.ts`
  and render at `/blog/<slug>` via `next-mdx-remote`. Three starter
  posts ship with the kit (how the kit is built, Polar vs Stripe,
  launch checklist). Add a post by dropping in a `.mdx` file and one
  entry in `src/lib/blog.ts`.
- **Changelog** — `/changelog` lists the real releases (v1, v2, Phase 1,
  Phase 2), dated as shipped. Add a release there when you ship one —
  never invent entries.
- **SEO** — every page has metadata and Open Graph tags (see
  `src/app/layout.tsx` and `src/lib/site.ts` for the canonical URL),
  plus `/sitemap.xml` and `/robots.txt` routes. Set
  `NEXT_PUBLIC_APP_URL` to your production domain so the tags point
  at the right place.
- **Testimonials** — the landing page has an honest empty state: no
  testimonials and no customer count until the first real buyer exists.
  Do not invent any.

## Analytics (optional, off by default)

- **Plausible** — privacy-friendly analytics (no cookies, no personal
  data). Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` to your own domain and the
  root layout (`src/app/layout.tsx`) injects Plausible's script
  (`https://plausible.io/js/script.js`) on every page.
- Without that variable, **no analytics script is injected and nothing
  is tracked** — the demo ships with analytics off.
- Plausible itself is a paid service (free trial, then from $9/month);
  the kit only wires in the script tag. Add your domain at plausible.io
  first, then set the variable and redeploy (`NEXT_PUBLIC_*` values are
  baked in at build time).

## Free Lite version

The `lite` branch is the free MIT version: landing + auth + dashboard,
no billing (no checkout routes, no webhooks, no billing page) and no
Pro update promises. Its pricing page links to the paid kit instead of
selling anything. It is a separate branch of this repo, not a separate
repo — check it out with `git checkout lite`. Never merge billing back
into it, and never merge its MIT license onto main.

## Agent rules

`AGENTS.md` (and `.cursor/rules/repo.mdc`) is the repo tour for AI
coding agents: setup, commands, where auth/billing/database live, and
the hard lessons (session pooler, session-cookie name, force-dynamic
auth pages). Keep it accurate when the layout changes.

## Deploy

- **Vercel (recommended):** import the repo, set the same env vars,
  deploy. Set `NEXT_PUBLIC_APP_URL` to the production domain. Use
  Postgres (Supabase) — see § Database.
- **Any Node host:** `npm run build && npm start` (Node ≥ 20.9).

## Customising for your buyers

- Brand colour: change the `brand` scale in `tailwind.config.ts`.
- Name: search for `SaaS Starter` and replace; set
  `NEXT_PUBLIC_APP_NAME` in `.env`.
- Plans/prices: edit `PLANS` in `src/lib/polar.ts` and the tiers in
  `src/app/pricing/page.tsx`.
- Data: seed data lives in `prisma/seed.ts` — delete or replace it;
  the dashboard queries the database, so no code change is needed.
- Auth providers: Google and magic links are built in (see § Auth);
  add more OAuth providers in `src/auth.ts` (the Prisma adapter
  tables already exist).

## What is still missing before it can be listed for sale

1. **Polar account + products** — create them and set the env vars
   (§ Billing). No accounts were created for this kit.
2. **Buyer-facing polish for the listing** — screenshots / a short demo
   video, a license file (see `LICENSE.md` — add one before selling),
   and a support email address. See `DEMO_PLAN.md`.
3. **A production database** — run the Postgres steps in § Database
   before deploying.

Auth, the database, the Polar and Stripe webhooks, email and settings
persistence are done.

## Honest limits

- No income is guaranteed; the median digital product earns little.
  This kit is a starting point, not a business.
- Checkout and the webhooks were verified only as far as the
  configuration / signature paths (no Polar or Stripe account with
  real keys exists in this repo, so no real payment was tested —
  see the verification notes in the delivery).
- The seed dashboard figures are fictional sample data, labelled as
  such; they are not real revenue.
