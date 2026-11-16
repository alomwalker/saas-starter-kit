/** Shared changelog data: the changelog page and the RSS feed both read this. */

/** Real releases only, dated as shipped. Nothing here is invented. */
export interface ChangelogRelease {
  version: string;
  /** ISO date (YYYY-MM-DD) as shipped. */
  date: string;
  title: string;
  items: string[];
}

export const RELEASES: ChangelogRelease[] = [
  {
    version: "Phase 2",
    date: "2026-11-16",
    title: "Content, trust and AI-ready",
    items: [
      "SEO: metadata and Open Graph on every page, sitemap and robots routes.",
      "MDX blog at /blog with three starter posts (how the kit is built, Polar vs Stripe, launch checklist).",
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
