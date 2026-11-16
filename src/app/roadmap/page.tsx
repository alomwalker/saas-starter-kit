import type { Metadata } from "next";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "What shipped, what is being built now, and what is planned next for the Lite version of the SaaS Starter Kit — only real items, no promises we cannot keep.",
};

/**
 * Lite roadmap — only real items. Shipped comes from the changelog
 * and the git history of the lite branch; In progress is work
 * actually under way; Planned is work with a named next step and
 * no date promised. Nothing here is billing: billing lives in the
 * paid kit, and the upgrade path is a planned item, not a feature.
 */
const SHIPPED: Array<{ label: string; date: string; note: string }> = [
  { label: "Lite version", date: "2026-11-16", note: "Landing + auth + dashboard, no billing, MIT licensed — the free version of the kit, on this branch." },
  { label: "Batch 1 (Lite)", date: "2026-11-16", note: "Dynamic OG images, launch waitlist, dashboard customer management + CSV export, showcase page." },
  { label: "Batch 2 (Lite)", date: "2026-11-16", note: "GitHub Actions CI, branded 404/error pages, two blog posts, waitlist CSV export, customer CSV import, rate limiting, changelog RSS." },
  { label: "Batch 3 (Lite)", date: "2026-11-16", note: "Change password in settings, security headers, two blog posts (Resend email, Google sign-in), docs search, Deploy to Vercel button, this roadmap and the landing-page FAQ." },
];

const IN_PROGRESS: Array<{ label: string; note: string }> = [
  {
    label: "Batch 3 — feature block",
    note: "The work under way now: change password, security headers, blog posts, docs search, the Deploy button, and this roadmap and the FAQ. It finishes the same day it started.",
  },
];

const PLANNED: Array<{ label: string; note: string }> = [
  {
    label: "More Lite blog posts",
    note: "Setup guides that are true without billing. The Stripe checkout post stays paid-kit-only — it describes code Lite does not have.",
  },
  {
    label: "Paid-kit upgrade path",
    note: "The pricing page already links to the paid kit (Starter $29 / Pro $49, one-time). The upgrade adds Polar and Stripe billing, future updates and 30 days of email support. No date is promised.",
  },
  {
    label: "Discord community",
    note: "Planned, but the server is the seller's to create. No community exists yet and none is claimed.",
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
          What shipped, what is being built now, and what is planned
          next for the Lite version. Every item here is real — shipped
          items are dated as shipped, and planned items carry no date
          we cannot keep.
        </p>
        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <Column
            title="Shipped"
            intro="Released on this branch."
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
