import type { Metadata } from "next";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "What changed in the SaaS Starter Kit, release by release — v1, v2, Phase 1 and Phase 2.",
};

/** Real releases only, dated as shipped. Nothing here is invented. */
const RELEASES: Array<{
  version: string;
  date: string;
  title: string;
  items: string[];
}> = [
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

export default function ChangelogPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="text-lg font-bold text-slate-900">
            ◆ SaaS Starter
          </a>
          <a href="/" className="text-sm text-slate-600 hover:text-slate-900">
            ← Back home
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold text-slate-900">Changelog</h1>
        <p className="mt-3 text-lg text-slate-600">
          What changed, release by release. Every entry below is a real
          release, dated as shipped.
        </p>
        <div className="mt-10 space-y-4">
          {RELEASES.map((r) => (
            <Card key={r.version} className="p-6">
              <div className="flex flex-wrap items-baseline gap-3">
                <h2 className="text-xl font-semibold text-slate-900">
                  {r.version} — {r.title}
                </h2>
                <span className="text-sm text-slate-500">{r.date}</span>
              </div>
              <ul className="mt-3 list-disc space-y-1.5 pl-6 text-sm leading-relaxed text-slate-700">
                {r.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
