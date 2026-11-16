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
          placeholder="Search the docs… (try “pooler”, “email”, “auth”)"
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
    </div>
  );
}
