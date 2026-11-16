import { Badge, Button, Card, SectionHeading } from "@/components/ui";

// Marketing numbers on the landing page — illustrative, not live data.
// Live numbers live on the dashboard, which reads the database.
const LANDING_STATS = [
  { label: "Monthly recurring revenue", value: "$12,480", change: "+12.4%" },
  { label: "Active customers", value: "1,284", change: "+8.1%" },
  { label: "Churn rate", value: "2.3%", change: "-0.4%" },
  { label: "New signups (30d)", value: "342", change: "+18.2%" },
];

function Nav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="text-lg font-bold text-slate-900">
          ◆ SaaS Starter
        </a>
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <a href="/pricing" className="hover:text-slate-900">Pricing</a>
          <a href="/docs" className="hover:text-slate-900">Docs</a>
          <a href="/dashboard" className="hover:text-slate-900">Dashboard</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button href="/auth/login" variant="ghost">Log in</Button>
          <Button href="/auth/signup">Get started</Button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-slate-500">
        <span>© 2026 SaaS Starter. Built with Next.js + Tailwind.</span>
        <span>
          <a href="/pricing" className="hover:text-slate-900">Pricing</a>
          {" · "}
          <a href="/docs" className="hover:text-slate-900">Docs</a>
          {" · "}
          <a href="/dashboard" className="hover:text-slate-900">Dashboard</a>
        </span>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
          <Badge tone="brand">Next.js 14 · TypeScript · Tailwind CSS</Badge>
          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-bold tracking-tight text-slate-900">
            Ship your SaaS in days, not months
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            A production-ready starter kit with a landing page, auth, a
            dashboard, and billing wired for Polar. Clone it, brand it,
            launch it.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button href="/auth/signup" className="px-6 py-3 text-base">Start building →</Button>
            <Button href="/docs" variant="secondary" className="px-6 py-3 text-base">Read the docs</Button>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Sign up free — no card required. Your account is stored in your own database.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LANDING_STATS.map((s) => (
              <Card key={s.label} className="p-5">
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="mt-1 text-sm text-emerald-600">{s.change} vs last month</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <SectionHeading
            eyebrow="Everything included"
            title="What you get out of the box"
            subtitle="The boring parts, done — so you can build the part that makes your product different."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { title: "Landing + pricing pages", body: "A polished marketing site with a pricing table that links straight into Polar checkout." },
              { title: "Auth, wired", body: "Login and signup with Auth.js — email + password, bcrypt-hashed and stored in your database. No demo login, no external account needed." },
              { title: "Dashboard + billing", body: "Stats, revenue chart, customer table, and a billing page that creates real Polar checkout sessions." },
              { title: "TypeScript, end to end", body: "Strict types, path aliases (@/*), and a clean src/ layout your buyers can extend without guessing." },
              { title: "Tailwind, ready to theme", body: "One brand colour scale in tailwind.config.ts — change three values and the whole kit is yours." },
              { title: "Docs included", body: "A /docs page covering setup, auth, billing, and deployment, so buyers are never stuck." },
            ].map((f) => (
              <Card key={f.title} className="p-6">
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button href="/pricing" className="px-6 py-3 text-base">See pricing →</Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
