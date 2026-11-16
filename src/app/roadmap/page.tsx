import type { Metadata } from "next";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "What shipped, what is being built now, and what is planned next for the SaaS Starter Kit — only real items, no promises we cannot keep.",
};

/**
 * Roadmap — only real items. Shipped comes from the changelog and the
 * git history; In progress is work actually under way; Planned is
 * work with a named next step and no date promised.
 */
const SHIPPED: Array<{ label: string; date: string; note: string }> = [
  { label: "v1 — first release", date: "2026-11-15", note: "Next.js 14 kit: landing, pricing, docs, demo login, dashboard, Polar checkout." },
  { label: "v2 — real auth and database", date: "2026-11-16", note: "Auth.js credentials auth, Prisma database, Polar webhook that activates plans." },
  { label: "Phase 1 — ShipFast parity", date: "2026-11-16", note: "Stripe checkout + webhook, Google OAuth + magic links, Resend email, Next.js 16, 14-day guarantee." },
  { label: "Phase 2 — content and trust", date: "2026-11-16", note: "SEO + MDX blog, AGENTS.md / Cursor rules, free Lite version, honest proof scaffolding." },
  { label: "Batch 1 — launch tooling", date: "2026-11-16", note: "Dynamic OG images, launch waitlist, dashboard customer management + CSV export, branded emails, showcase page, Plausible hook (off by default), two blog posts, Polar affiliate finding documented." },
  { label: "Site icon", date: "2026-11-16", note: "Indigo diamond favicon, Apple touch icon, and the same mark in every header." },
];

const IN_PROGRESS: Array<{ label: string; note: string }> = [
  {
    label: "Batch 2 — feature block",
    note: "GitHub Actions CI, JSON-LD, FAQ, this roadmap, branded 404/error pages, waitlist CSV export, changelog RSS, customer CSV import, rate limiting, and two more blog posts.",
  },
  {
    label: "Week 2 launch prep",
    note: "Launch drafts are written (Product Hunt, Show HN, Reddit, Indie Hackers, X, Dev.to) with the live demo link; posting runs 23–29 Nov 2026 and needs the seller's accounts.",
  },
];

const PLANNED: Array<{ label: string; note: string }> = [
  {
    label: "Product Hunt launch",
    note: "Week 2 of the launch plan. No launch date is promised until the payout account is connected and checkout is verified end to end.",
  },
  {
    label: "Affiliate programme via Affonso",
    note: "Polar has no native affiliate programme, so the documented route is a third-party tool (Affonso, in Polar's own docs). No commission rate is promised — none is documented for sellers.",
  },
  {
    label: "Discord community",
    note: "Planned, but the server is the seller's to create — David creates it. No community exists yet and none is claimed.",
  },
];

function Column({
  title,
  intro,
  items,
}: {
  title: string;
  intro: string;
  items: Array<{ label: string; date?: string; note: string }>;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{intro}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <Card key={item.label} className="p-5">
            <p className="font-semibold text-slate-900">{item.label}</p>
            {item.date ? (
              <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">{item.date}</p>
            ) : null}
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.note}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default function RoadmapPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <img src="/icon.svg" alt="" className="h-5 w-5" />
            SaaS Starter
          </a>
          <a href="/" className="text-sm text-slate-600 hover:text-slate-900">
            ← Back home
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-4xl font-bold text-slate-900">Roadmap</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          What shipped, what is being built now, and what is planned next.
          Every item here is real — shipped items are dated as shipped,
          and planned items carry no date we cannot keep.
        </p>
        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <Column
            title="Shipped"
            intro="Released and live on the demo."
            items={SHIPPED}
          />
          <Column
            title="In progress"
            intro="Being built right now."
            items={IN_PROGRESS}
          />
          <Column
            title="Planned"
            intro="Next, with no date promised."
            items={PLANNED}
          />
        </div>
        <p className="mt-10 text-sm text-slate-500">
          See the dated release notes on the <a href="/changelog" className="font-medium text-brand-600 hover:underline">changelog</a>.
        </p>
      </main>
    </div>
  );
}
