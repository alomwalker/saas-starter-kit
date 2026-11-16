"use client";

import { useState } from "react";
import { Button, Card, SectionHeading } from "@/components/ui";
import { PLANS, type BillingPlan } from "@/lib/polar";

const TIERS: Array<{
  plan: BillingPlan | "free";
  name: string;
  price: string;
  blurb: string;
  features: string[];
  cta: string;
}> = [
  {
    plan: "free",
    name: "Free",
    price: "$0",
    blurb: "Try the dashboard, no card required.",
    features: ["1 project", "Community support", "Core dashboard"],
    cta: "Start free",
  },
  {
    plan: "starter",
    name: "Starter",
    price: `$${PLANS.starter.priceUsd}`,
    blurb: "For small teams getting serious.",
    features: PLANS.starter.features,
    cta: "Buy Starter",
  },
  {
    plan: "pro",
    name: "Pro",
    price: `$${PLANS.pro.priceUsd}`,
    blurb: "For teams that need everything.",
    features: PLANS.pro.features,
    cta: "Buy Pro",
  },
];

export default function PricingPage() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<BillingPlan | null>(null);
  const [provider, setProvider] = useState<"polar" | "stripe">("polar");

  async function buy(plan: BillingPlan) {
    setError(null);
    setBusy(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, provider }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || "Checkout failed. Is a payment provider configured? See README § Billing.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Checkout failed — could not reach the server.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="text-lg font-bold text-slate-900">◆ SaaS Starter</a>
          <a href="/" className="text-sm text-slate-600 hover:text-slate-900">← Back home</a>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple pricing, no surprises"
          subtitle="Start free. Upgrade when you need more. One-time payment — checkout is handled by Polar or Stripe."
        />
        <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-2 text-sm">
          <span className="text-slate-600">Pay with:</span>
          {(["polar", "stripe"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProvider(p)}
              aria-pressed={provider === p}
              className={
                provider === p
                  ? "rounded-full bg-brand-600 px-4 py-1.5 font-medium text-white"
                  : "rounded-full border border-slate-300 bg-white px-4 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              }
            >
              {p === "polar" ? "Polar" : "Stripe"}
            </button>
          ))}
        </div>
        <p className="mx-auto mt-3 max-w-md text-center text-xs text-slate-500">
          {provider === "polar"
            ? "Polar is the merchant of record — it handles tax for you."
            : "Stripe checkout — pay with your card, straight to the seller's Stripe account."}
        </p>
        {error ? (
          <div className="mx-auto mt-8 max-w-2xl rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            {error}
          </div>
        ) : null}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TIERS.map((t) => (
            <Card key={t.name} className="flex flex-col p-6">
              <h3 className="text-lg font-semibold text-slate-900">{t.name}</h3>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {t.price}
                {t.plan === "free" ? null : (
                  <span className="text-base font-normal text-slate-500"> one-time</span>
                )}
              </p>
              <p className="mt-2 text-sm text-slate-600">{t.blurb}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-700">
                {t.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <div className="mt-6">
                {t.plan === "free" ? (
                  <Button href="/auth/signup" className="w-full">{t.cta}</Button>
                ) : (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => buy(t.plan as BillingPlan)}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {busy === t.plan ? "Opening checkout…" : t.cta}
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-slate-500">
          Prices in USD. Polar is the merchant of record and handles tax; Stripe checkout is also available.
          14-day money-back guarantee — a full refund within 14 days of purchase, contact alomwalker21@gmail.com.
        </p>
      </main>
    </div>
  );
}
