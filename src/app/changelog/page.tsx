import type { Metadata } from "next";
import { Card } from "@/components/ui";
import { RELEASES } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "What changed in the SaaS Starter Kit, release by release — v1, v2, Phase 1 and Phase 2.",
};

export default function ChangelogPage() {
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
