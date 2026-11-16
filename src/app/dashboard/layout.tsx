import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSessionUser();
  if (!session) redirect("/auth/login?next=/dashboard");

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white p-5 md:flex">
        <a href="/" className="text-lg font-bold text-slate-900">◆ SaaS Starter</a>
        <nav className="mt-8 space-y-1 text-sm">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          Signed in as
          <p className="mt-1 font-medium text-slate-900">{session.name}</p>
          <p className="truncate">{session.email}</p>
          <p className="mt-1">Plan: <span className="font-medium capitalize">{session.plan}</span></p>
          <form action="/api/auth/logout" method="post" className="mt-3">
            <button type="submit" className="text-brand-600 hover:underline">Log out</button>
          </form>
        </div>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 md:hidden">
          <a href="/" className="font-bold text-slate-900">◆ SaaS Starter</a>
          <nav className="flex gap-4 text-sm">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="text-slate-700">{item.label}</a>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
