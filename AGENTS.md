# AGENTS.md — SaaS Starter Kit

Instructions for AI coding agents working in this repo (Cursor, Claude Code, and friends). The same rules live in `.cursor/rules/repo.mdc` — this file is the human-readable copy.

## What this is

A production-ready Next.js SaaS starter kit: landing page, pricing, docs, MDX blog, changelog, real auth, a database-backed dashboard, and billing via Polar (merchant of record) or Stripe. One-time purchase, $29 Starter / $49 Pro.

## Setup

```bash
npm install
cp .env.example .env        # set AUTH_SECRET (openssl rand -base64 32) and DATABASE_URL
npm run db:setup            # prisma db push + seed (sample data, labelled)
npm run dev                 # http://localhost:3000
```

## Commands

- `npm run typecheck` — `tsc --noEmit`. Must pass before any commit.
- `npm run build` — production build. Must pass before any commit.
- `npm run dev` / `npm start` — dev / production server.
- `npm run db:push` / `npm run db:seed` — apply schema / reseed sample data.

## Where things live

- `src/app/` — App Router pages: `/` (landing), `/pricing`, `/docs`, `/blog`, `/changelog`, `/auth/*`, `/dashboard/*`.
- `src/auth.ts` — Auth.js (NextAuth v5): credentials (bcrypt), Google OAuth, magic links, JWT sessions. `src/proxy.ts` (Next.js 16) validates the session on `/dashboard`.
- `src/lib/polar.ts` + `src/lib/stripe.ts` — checkout. `src/app/api/checkout/` — `POST { plan, provider }`. `src/app/api/webhooks/polar|stripe/` — signature-verified webhooks that activate plans.
- `src/lib/email.ts` — Resend: verification, password reset, welcome, magic links.
- `src/lib/blog.ts` + `src/content/blog/*.mdx` — blog posts (rendered by `src/app/blog/[slug]/page.tsx` with `next-mdx-remote`).
- `src/lib/site.ts` — canonical site URL, name, description (used by metadata, sitemap, robots).
- `prisma/schema.prisma` — Postgres schema. `prisma/seed.ts` — fictional sample data, clearly labelled.
- `src/components/ui.tsx` — Button, Card, Badge, SectionHeading. Reuse these; do not invent new primitives for one page.

## Rules that have bitten before

- **DATABASE_URL must be the Supabase session pooler (port 5432), never the transaction pooler (6543).** The transaction pooler hangs `prisma db push` and breaks Prisma at runtime (error 42P05, prepared statement already exists). The direct connection (`db.<ref>.supabase.co`) is IPv6-only and unreachable from Vercel's build network.
- **Middleware is `src/proxy.ts` in Next.js 16** (renamed from `middleware.ts`). `getToken()` must be told the session cookie name: over HTTPS Auth.js sets `__Secure-authjs.session-token`; the default name is the plain-HTTP one and login will loop forever.
- **Login/signup pages are `force-dynamic`** — they read env vars at request time. Never statically prerender them, or a seller who adds Google/Resend keys after deploying will never see the buttons.
- **No demo login, no invented data.** Never add a demo user, fake testimonials, fake customer counts, or fake revenue. Empty states must say so honestly.
- **No secrets in code or in git.** Env vars only (`.env.example` documents them). The Polar org/product IDs in `.env.example` are public identifiers, not secrets.
- **Keep the build warning-free** and the smoke test green: `/`, `/pricing`, `/docs`, `/blog`, `/changelog`, `/sitemap.xml`, `/robots.txt` all 200; signup 200; login → dashboard 200; Polar checkout 200; Stripe checkout 400 "not configured" when no keys are set.

## The Lite version

The `lite` branch is the free MIT version: landing + auth + dashboard, no billing. Never merge billing back into it, and never merge the Lite license (MIT) onto main.
