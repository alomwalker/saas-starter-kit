/**
 * The changelog's release list — the single source of truth for the
 * /changelog page and the /changelog/rss.xml feed. Real releases
 * only, dated as shipped. Nothing here is invented.
 */
export type ChangelogRelease = {
  version: string;
  date: string;
  title: string;
  items: string[];
};

export const RELEASES: ChangelogRelease[] = [
  {
    version: "Batch 3 (Lite)",
    date: "2026-11-16",
    title: "Settings, search and docs",
    items: [
      "Change password in dashboard settings (current + new password, minimum 8 characters).",
      "Security headers on every response (nosniff, referrer policy, frame deny, permissions policy).",
      "Two more blog posts: setting up email with Resend, wiring up Google sign-in. The Stripe post stays paid-kit-only.",
      "Client-side search on the docs page.",
      "Deploy to Vercel button in the README and docs — with the note that it imports the paid kit's default branch unless you pick lite.",
      "Lite FAQ on the landing page and this Lite roadmap page.",
    ],
  },
  {
    version: "Batch 2 (Lite)",
    date: "2026-11-16",
    title: "Trust and tooling",
    items: [
      "GitHub Actions CI: typecheck + build on every push and pull request.",
      "Branded 404 and error pages.",
      "Two more blog posts and a changelog RSS feed at /changelog/rss.xml.",
      "Waitlist CSV export and customer CSV import in the dashboard.",
      "In-memory per-IP rate limiting (10 requests per minute per endpoint).",
    ],
  },
  {
    version: "Batch 1 (Lite)",
    date: "2026-11-16",
    title: "Launch tooling",
    items: [
      "Dynamic OG images for the landing page and every blog post.",
      "Launch waitlist: landing-page form with a dashboard list.",
      "Dashboard customer management: add, delete, CSV export.",
      "Public showcase page with an honest empty state.",
    ],
  },
  {
    version: "Phase 2",
    date: "2026-11-16",
    title: "Content, trust and AI-ready",
    items: [
      "SEO: metadata and Open Graph on every page, sitemap and robots routes.",
      "MDX blog at /blog with starter posts (how the kit is built, launch checklist). The Lite branch drops the billing post — billing lives in the paid kit.",
      "AGENTS.md and Cursor rules for agent-assisted development.",
      "Free Lite version (landing + auth + dashboard, no billing) on the lite branch, MIT licensed.",
      "Proof scaffolding: honest testimonials section and this changelog.",
    ],
  },
  {
    version: "Phase 1",
    date: "2026-11-16",
    title: "ShipFast parity — buyer-facing gaps",
    items: [
      "Stripe checkout and verified webhook alongside Polar; the buyer connects their own Stripe keys.",
      "Google OAuth and magic-link login (credentials + bcrypt kept).",
      "Resend email: password reset, email verification, welcome email.",
      "Next.js 14 → 16 and React 18 → 19 upgrade.",
      "14-day money-back guarantee in the license, pricing page and README.",
    ],
  },
  {
    version: "v2",
    date: "2026-11-16",
    title: "Real auth and database",
    items: [
      "Auth.js credentials auth with bcrypt-hashed passwords; the demo login was deleted.",
      "Prisma database (SQLite locally, Postgres in production); dashboard, billing and settings wired to real rows.",
      "Polar webhook implemented and verified — paid plans activate automatically.",
    ],
  },
  {
    version: "v1",
    date: "2026-11-15",
    title: "First release",
    items: [
      "Next.js 14 starter kit: landing page, pricing, docs, demo-only login, dashboard with stat cards, revenue chart and customers table.",
      "Polar checkout wired in; webhook left as an explicit stub.",
    ],
  },
];
