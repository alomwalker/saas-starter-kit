"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui";

export type DocsSection = { title: string; body: string[] };

/**
 * Client-side docs search — no external service, no index build
 * step. Filters the sections as you type: a section shows when
 * its title or any of its lines matches, and inside a matching
 * section only the matching lines are shown (unless the title
 * itself matched, in which case the whole section shows).
 */
export default function DocsSearch({ sections }: { sections: DocsSection[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return sections.map((s) => ({ ...s, lines: s.body }));
    const out: Array<DocsSection & { lines: string[] }> = [];
    for (const s of sections) {
      const titleHit = s.title.toLowerCase().includes(q);
      const lines = s.body.filter((line) => line.toLowerCase().includes(q));
      if (titleHit) out.push({ ...s, lines: s.body });
      else if (lines.length > 0) out.push({ ...s, lines });
    }
    return out;
  }, [sections, q]);

  // The Deploy-to-Vercel card is part of the search too: it stays
  // visible with no query, or when the query matches its text.
  const deployText =
    "deploy to vercel one click imports this repo into vercel env vars build command";
  const showDeploy = !q || deployText.includes(q);

  return (
    <div>
      <div className="mt-8">
        <label className="sr-only" htmlFor="docs-search">
          Search the docs
        </label>
        <input
          id="docs-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the docs… (try “billing”, “pooler”, “email”)"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none"
        />
        {q ? (
          <p className="mt-2 text-sm text-slate-500">
            {filtered.length > 0
              ? `${filtered.length} section${filtered.length === 1 ? "" : "s"} match${filtered.length === 1 ? "es" : ""} “${query.trim()}”`
              : `No sections match “${query.trim()}” — try another term.`}
            {filtered.length === 0 ? null : (
              <>
                {" "}
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="font-medium text-brand-600 hover:underline"
                >
                  Clear search
                </button>
              </>
            )}
          </p>
        ) : null}
      </div>
      <div className="mt-6 space-y-4">
        {filtered.map((s) => (
          <Card key={s.title} className="p-6">
            <h2 className="text-lg font-semibold text-slate-900">{s.title}</h2>
            <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-slate-700">
              {s.lines.map((line) => (
                <li key={line} className="font-mono text-[13px]">
                  {line}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      {showDeploy ? (
        <Card className="mt-6 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Deploy to Vercel</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            One click imports this repo into Vercel. You still have to
            set the env vars and the build command from the Deploy
            section above — without them the deploy builds and then
            fails at runtime.
          </p>
          <a
            href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Falomwalker%2Fsaas-starter-kit"
            className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            ▲ Deploy to Vercel
          </a>
        </Card>
      ) : null}
    </div>
  );
}
