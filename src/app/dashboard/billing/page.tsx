"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Badge, Card } from "@/components/ui";
import { PLANS, type BillingPlan } from "@/lib/polar";

function BillingInner() {
  const params = useSearchParams();
  const success = params.get("checkout") === "success";
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<BillingPlan | null>(null);

  async function buy(plan: BillingPlan) {
    setError(null);
    setBusy(plan);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    setBusy(null);
    if (!res.ok || !data.url) {
      setError(data.error || "Checkout failed.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
      <p className="mt-1 text-slate-600">Manage your plan. Checkout is handled by Polar (merchant of record).</p>
      {success ? (
        <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          Payment received — thank you. Your plan is activated automatically by the Polar webhook once Polar confirms the payment.
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error}</p>
      ) : null}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {(Object.keys(PLANS) as BillingPlan[]).map((key) => (
          <Card key={key} className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{PLANS[key].name}</h2>
              <Badge tone="brand">${PLANS[key].priceUsd} one-time</Badge>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
              {PLANS[key].features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => buy(key)}
              className="mt-5 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {busy === key ? "Opening checkout…" : `Upgrade to ${PLANS[key].name}`}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense>
      <BillingInner />
    </Suspense>
  );
}
