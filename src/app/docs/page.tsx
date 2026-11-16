import type { Metadata } from "next";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Setup, auth, database, billing and deployment docs for the SaaS Starter Kit.",
};

const SECTIONS: Array<{ title: string; body: string[] }> = [
  {
    title: "Quick start",
    body: [
      "1. npm install",
      "2. cp .env.example .env — set AUTH_SECRET and DATABASE_URL",
      "3. npm run db:setup — creates the database and seeds sample data",
      "4. npm run dev — open http://localhost:3000",
      "5. Sign up at /auth/signup — your account is stored in the database",
      "Measured setup time (2026-11-16, clean clone): 59 seconds to a responding dev server with a cold package cache (30s warm).",
    ],
  },
  {
    title: "Project layout",
    body: [
      "src/app/ — App Router pages: landing (/), /pricing, /docs, /blog, /changelog, /auth/*, /dashboard/*",
      "src/lib/site.ts — canonical site URL, name and description (metadata, sitemap, robots)",
      "src/lib/blog.ts + src/content/blog/*.mdx — blog posts, rendered by /blog/[slug] with next-mdx-remote",
      "src/app/sitemap.ts + src/app/robots.ts — /sitemap.xml and /robots.txt",
      "AGENTS.md + .cursor/rules/repo.mdc — agent instructions: setup, layout, hard lessons",
      "lite branch — the free MIT version: landing + auth + dashboard, no billing",
      "src/auth.ts — Auth.js (NextAuth v5) config: credentials, Google OAuth, magic links, JWT sessions",
      "src/lib/auth.ts — getSessionUser() used by pages",
      "src/lib/db.ts — PrismaClient singleton",
      "src/lib/polar.ts — Polar checkout (merchant of record)",
      "src/lib/stripe.ts — Stripe checkout (inline price_data, no pre-created products)",
      "src/lib/email.ts — Resend email: verification, password reset, welcome",
      "prisma/schema.prisma — database schema (PostgreSQL)",
      "prisma/seed.ts — sample customers, revenue and settings (labelled sample data)",
      "src/proxy.ts — protects /dashboard by validating the Auth.js session token",
    ],
  },
  {
    title: "Auth",
    body: [
      "Auth.js (NextAuth v5) with three sign-in options: email + password (credentials), Google OAuth, and magic links via Resend.",
      "Signup creates a User row; the password is stored as a bcrypt hash, never in plain text. Google-only accounts have no password until one is set.",
      "Login checks the hash (or the OAuth / magic-link flow) and issues a signed JWT session (AUTH_SECRET).",
      "Auth.js Credentials only supports JWT sessions — that is why sessions are JWT, while users, subscriptions and dashboard data live in the database.",
      "Signup sends a verification email (24h link); password reset is at /auth/reset-password (1h single-use token). Both need RESEND_API_KEY — without it, auth still works and the email steps report \"not configured\".",
      "A Google sign-in can never take over an existing password account with the same email — it is rejected (OAuthAccountNotLinked).",
      "There is no demo login in this kit. Set AUTH_SECRET to a long random value (openssl rand -base64 32).",
    ],
  },
  {
    title: "Database",
    body: [
      "Prisma with PostgreSQL: set DATABASE_URL to your Postgres string, then npx prisma generate && npm run db:setup.",
      "Models: User, Customer, Subscription, MonthlyRevenue, Setting (+ Auth.js Account/Session/VerificationToken).",
      "For production Postgres (Supabase is the recommended free host): use the session pooler (port 5432) on serverless hosts — the transaction pooler breaks Prisma at runtime.",
      "Dashboard stats, revenue chart, customers table and settings all read from the database.",
      "Seed data is fictional sample data — replace it with real data before launch.",
    ],
  },
  {
    title: "Billing (Polar or Stripe)",
    body: [
      "Two checkout options — the buyer picks on /pricing or /dashboard/billing; Polar is the default.",
      "Polar (merchant of record, handles tax): create a product in Polar, copy its ID into POLAR_PRODUCT_ID_STARTER / POLAR_PRODUCT_ID_PRO, and set POLAR_ACCESS_TOKEN.",
      "Stripe: only STRIPE_SECRET_KEY is needed — checkout uses inline price_data, so no Stripe products have to be pre-created.",
      "Buyers click Buy on /pricing → POST /api/checkout { plan, provider } → Polar or Stripe checkout URL.",
      "Polar webhooks POST to /api/webhooks/polar — the signature is verified (Svix) and a completed order/subscription activates the buyer's plan in the database; cancellations downgrade them to free.",
      "Stripe webhooks POST to /api/webhooks/stripe — the signature is verified (HMAC-SHA256) and a completed Checkout Session activates the buyer's plan from its metadata; a refunded charge downgrades them to free.",
      "Set the webhook URLs (https://your-domain.com/api/webhooks/polar and /api/webhooks/stripe) and the matching secrets (POLAR_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET).",
      "Fallback: Paddle is also a merchant of record — see README § Billing.",
    ],
  },
  {
    title: "Blog, SEO and changelog",
    body: [
      "Every page has metadata + Open Graph tags (see src/lib/site.ts for the canonical URL); /sitemap.xml and /robots.txt are generated routes.",
      "The blog at /blog is MDX: add a .mdx file to src/content/blog/ and one entry to src/lib/blog.ts — the post renders at /blog/<slug>.",
      "The changelog at /changelog lists real releases only, dated as shipped. Add an entry when you ship; never invent one.",
      "The landing page's testimonials section is an honest empty state — no testimonials and no customer count until the first real buyer exists.",
    ],
  },
  {
    title: "Analytics (optional, off by default)",
    body: [
      "Plausible (privacy-friendly, no cookies): set NEXT_PUBLIC_PLAUSIBLE_DOMAIN to your own domain and the root layout injects Plausible's script on every page.",
      "Without that variable, no analytics script is injected and nothing is tracked — the demo ships with analytics off.",
      "Plausible itself is a paid service (free trial, then from $9/month); the kit only wires in the script tag. Add your domain at plausible.io first, then set the variable.",
    ],
  },
  {
    title: "Deploy",
    body: [
      "Vercel: import the repo, set the same env vars, deploy. Any Node host works too: npm run build && npm start (Node ≥ 20.9).",
      "Set NEXT_PUBLIC_APP_URL to your production domain before launch.",
      "On Vercel, use Postgres (Supabase) with the session pooler (port 5432).",
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900"><img src="/icon.svg" alt="" className="h-5 w-5" />SaaS Starter</a>
          <a href="/" className="text-sm text-slate-600 hover:text-slate-900">← Back home</a>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold text-slate-900">Documentation</h1>
        <p className="mt-3 text-lg text-slate-600">
          Everything you need to run, brand, and launch this starter kit.
        </p>
        <div className="mt-10 space-y-4">
          {SECTIONS.map((s) => (
            <Card key={s.title} className="p-6">
              <h2 className="text-lg font-semibold text-slate-900">{s.title}</h2>
              <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-slate-700">
                {s.body.map((line) => (
                  <li key={line} className="font-mono text-[13px]">{line}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
