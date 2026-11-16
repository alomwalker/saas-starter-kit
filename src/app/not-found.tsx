import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "This page doesn't exist or has moved. Head back home or read the docs.",
};

export default function NotFound() {
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
      <main className="mx-auto max-w-2xl px-6 py-20 text-center">
        <img src="/icon.svg" alt="" className="mx-auto h-10 w-10" />
        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-indigo-600">
          404
        </p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          Page not found
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          This page doesn&apos;t exist or has moved. The link may be mistyped,
          or the page may have been removed.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/"
            className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Go home
          </a>
          <a
            href="/docs"
            className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Read the docs
          </a>
        </div>
      </main>
    </div>
  );
}
