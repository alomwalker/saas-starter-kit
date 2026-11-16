import { Card } from "@/components/ui";

const SECTIONS: Array<{ title: string; body: string[] }> = [
  {
    title: "Quick start",
    body: [
      "1. npm install",
      "2. cp .env.example .env — set AUTH_SECRET and DATABASE_URL",
      "3. npm run db:setup — creates the database and seeds sample data",
      "4. npm run dev — open http://localhost:3000",
      "5. Sign up at /auth/signup — your account is stored in the database",
    ],
  },
  {
    title: "Project layout",
    body: [
      "src/app/ — App Router pages: landing (/), /pricing, /docs, /auth/*, /dashboard/*",
      "src/auth.ts — Auth.js (NextAuth v5) config: credentials provider, JWT sessions",
      "src/lib/auth.ts — getSessionUser() used by pages",
      "src/lib/db.ts — PrismaClient singleton",
      "src/lib/polar.ts — Polar checkout (merchant of record)",
      "prisma/schema.prisma — database schema (SQLite by default)",
      "prisma/seed.ts — sample customers, revenue and settings (labelled sample data)",
      "src/middleware.ts — protects /dashboard by validating the Auth.js session token",
    ],
  },
  {
    title: "Auth",
    body: [
      "Auth.js (NextAuth v5) with a credentials provider — no external account needed.",
      "Signup creates a User row; the password is stored as a bcrypt hash, never in plain text.",
      "Login checks the hash and issues a signed JWT session (AUTH_SECRET).",
      "Auth.js Credentials only supports JWT sessions — that is why sessions are JWT, while users, subscriptions and dashboard data live in the database.",
      "There is no demo login in this kit. Set AUTH_SECRET to a long random value (openssl rand -base64 32).",
    ],
  },
  {
    title: "Database",
    body: [
      "Prisma, SQLite out of the box: DATABASE_URL=\"file:./dev.db\", then npm run db:setup.",
      "Models: User, Customer, Subscription, MonthlyRevenue, Setting (+ Auth.js Account/Session/VerificationToken).",
      "For production Postgres (Supabase is the recommended free host): copy prisma/schema.postgres.prisma over prisma/schema.prisma, set DATABASE_URL to your Postgres string, then npx prisma generate && npm run db:push && npm run db:seed.",
      "Dashboard stats, revenue chart, customers table and settings all read from the database.",
      "Seed data is fictional sample data — replace it with real data before launch.",
    ],
  },
  {
    title: "Billing (Polar)",
    body: [
      "Create a product in Polar, copy its ID into POLAR_PRODUCT_ID_STARTER / POLAR_PRODUCT_ID_PRO, and set POLAR_ACCESS_TOKEN.",
      "Buyers click Buy on /pricing → POST /api/checkout → Polar checkout URL.",
      "Polar webhooks POST to /api/webhooks/polar — the signature is verified (Svix) and a completed order/subscription activates the buyer's plan in the database; cancellations downgrade them to free.",
      "Set the webhook URL in Polar to https://your-domain.com/api/webhooks/polar and set POLAR_WEBHOOK_SECRET.",
      "Fallback: Paddle is also a merchant of record — see README § Billing.",
    ],
  },
  {
    title: "Deploy",
    body: [
      "Vercel: import the repo, set the same env vars, deploy. Any Node host works too: npm run build && npm start.",
      "Set NEXT_PUBLIC_APP_URL to your production domain before launch.",
      "On Vercel, use Postgres (Supabase) — the SQLite file does not persist there.",
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="text-lg font-bold text-slate-900">◆ SaaS Starter</a>
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
