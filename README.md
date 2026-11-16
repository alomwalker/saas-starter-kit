# SaaS Starter Kit — Next.js Dashboard / Admin Starter (Lite)

> **This is the free Lite version** (the `lite` branch): landing page,
> real auth, and a database-backed dashboard with stats / revenue chart /
> customer table and settings that persist. **No billing** — no checkout,
> no webhooks, no billing page. The paid kit (main branch, $29 Starter /
> $49 Pro) adds Polar and Stripe checkout. Clone it, brand it, launch it.

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
| Pricing page | `src/app/pricing/page.tsx` — shows the paid kit's tiers ($29 / $49) and links out to it; Lite itself sells nothing |
| Docs | `src/app/docs/page.tsx` |
| Blog | `src/app/blog/` — MDX blog (`src/content/blog/*.mdx`, rendered with `next-mdx-remote`), 2 starter posts |
| Changelog | `src/app/changelog/page.tsx` — real releases only, dated as shipped |
| Showcase | `src/app/showcase/page.tsx`, `SHOWCASE.md` — public leaderboard, honest empty state until the first buyer ships; listings are manual and reviewed |
| SEO | `src/app/layout.tsx` (metadata + Open Graph), `src/app/sitemap.ts`, `src/app/robots.ts`, `src/lib/site.ts` (canonical URL) |
| Agent rules | `AGENTS.md` + `.cursor/rules/repo.mdc` — setup, layout, and the hard lessons (session pooler, cookie name, force-dynamic auth pages) |
| Auth | `src/auth.ts` (Auth.js config), `src/app/auth/login`, `src/app/auth/signup`, `src/app/auth/reset-password`, `src/lib/auth.ts`, `src/proxy.ts` |
| Email | `src/lib/email.ts` — Resend: verification, password reset, welcome, magic links |
| Database | `prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/db.ts` |
| Dashboard | `src/app/dashboard/` — overview (from the DB: add/delete customers, CSV export, waitlist list), settings (persisted); sidebar layout |
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

## Rate limiting

The public write endpoints are rate-limited in memory
(`src/lib/rate-limit.ts`): **10 requests per minute per IP per
endpoint** on `POST /api/waitlist`, `POST /api/customers` and
`POST /api/auth/signup`. Each endpoint has its own bucket, so a
burst on the waitlist never blocks a signup from the same IP.
Past the limit the endpoint answers **429**
with a JSON error and a `Retry-After` header. The limit is per IP
(`x-forwarded-for`, first entry, else `x-real-ip`).

This is a starter-kit guard, not a security boundary: the counters
live in one server process's memory and are not shared across
instances, and a determined attacker can rotate IPs. If you run
multiple instances or need stronger abuse protection, swap it for
Upstash Ratelimit or a Redis-backed limiter — the check is one call
at the top of each route handler.

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

## Billing — paid kit only

This Lite branch has no billing: no checkout routes, no webhooks, no
billing page, and no Polar/Stripe code. If you need to take money, use
the paid kit (main branch, $29 Starter / $49 Pro), which adds Polar
(merchant of record) and Stripe checkout, each with a verified webhook
that activates plans. The pricing page in this branch links to it.

## Blog, changelog and SEO

- **Blog** — `/blog` is an MDX blog. Posts live in
  `src/content/blog/*.mdx` with their titles/dates in `src/lib/blog.ts`
  and render at `/blog/<slug>` via `next-mdx-remote`. Three starter
  posts ship with the kit (how the kit is built, launch checklist).
  Add a post by dropping in a `.mdx` file and one
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

## This branch is the Lite version

You are on the free MIT version: landing + auth + dashboard, no billing
(no checkout routes, no webhooks, no billing page) and no Pro update
promises. Its pricing page links to the paid kit instead of selling
anything. Never merge billing back into this branch, and never merge
this MIT license onto main (the paid kit has a commercial license).

## Agent rules

`AGENTS.md` (and `.cursor/rules/repo.mdc`) is the repo tour for AI
coding agents: setup, commands, where auth/database live, and
the hard lessons (session pooler, session-cookie name, force-dynamic
auth pages). Keep it accurate when the layout changes.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Falomwalker%2Fsaas-starter-kit)

One click imports the repo into Vercel — but note that it imports
the repo's default branch, which is the **paid kit**. To deploy
**this Lite version**, pick the `lite` branch on Vercel's import
screen instead. Either way, the deploy still needs two things
from you afterwards, or it will build and then fail at runtime:

- **Env vars** (Vercel → Project Settings → Environment Variables,
  Production and Preview): `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`,
  `DATABASE_URL` and `DIRECT_URL` (Supabase session pooler, port
  5432). Optional: `RESEND_API_KEY`, `EMAIL_FROM`,
  `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`,
  `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. Billing keys (Polar/Stripe) do
  not exist in Lite — they belong to the paid kit. See
  `.env.example` for the full list.
- **Build command** (Project Settings → Build and Deployment):
  `prisma generate && DATABASE_URL=$DIRECT_URL prisma db push --accept-data-loss && prisma db seed && next build`,
  plus the env var `CI=true` (Next.js 16's build fails on Vercel
  without it). See the deploying-to-vercel blog post for why each
  part is there.

- **Vercel (recommended):** import the repo, set the same env vars,
  deploy. Set `NEXT_PUBLIC_APP_URL` to the production domain. Use
  Postgres (Supabase) — see § Database.
- **Any Node host:** `npm run build && npm start` (Node ≥ 20.9).

## Customising for your buyers

- Brand colour: change the `brand` scale in `tailwind.config.ts`.
- Name: search for `SaaS Starter` and replace; set
  `NEXT_PUBLIC_APP_NAME` in `.env`.
- Plans/prices: the tiers in `src/app/pricing/page.tsx` describe the
  paid kit — edit them there. (Billing itself lives on main, not here.)
- Data: seed data lives in `prisma/seed.ts` — delete or replace it;
  the dashboard queries the database, so no code change is needed.
- Auth providers: Google and magic links are built in (see § Auth);
  add more OAuth providers in `src/auth.ts` (the Prisma adapter
  tables already exist).

## What is still missing before you ship with Lite

1. **A production database** — run the Postgres steps in § Database
   before deploying.
2. **Your own branding** — see § Customising (name, colours, copy).
3. **Billing, if you want to charge** — that is the paid kit (main
   branch). This branch will never take a payment.

Auth, the database, email and settings persistence are done. The
license is MIT — no purchase needed (see `LICENSE.md`).

## Honest limits

- No income is guaranteed; the median digital product earns little.
  This kit is a starting point, not a business.
- The seed dashboard figures are fictional sample data, labelled as
  such; they are not real revenue.
