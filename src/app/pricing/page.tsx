import { Button, Card, SectionHeading } from "@/components/ui";

/**
 * Lite pricing page — this branch has no billing at all, so there is
 * no buy flow here. The tiers below describe the PAID kit; the button
 * links out to it. Lite itself is free.
 */
const PAID_KIT_URL = "https://saas-starter-kit-puce.vercel.app/pricing";

const TIERS: Array<{
  name: string;
  price: string;
  blurb: string;
  features: string[];
}> = [
  {
    name: "Free",
    price: "$0",
    blurb: "Try the dashboard, no card required.",
    features: ["1 project", "Community support", "Core dashboard"],
  },
  {
    name: "Starter",
    price: "$29",
    blurb: "For small teams getting serious.",
    features: ["1 project, 3 team seats", "Dashboard + analytics", "Email support"],
  },
  {
    name: "Pro",
    price: "$49",
    blurb: "For teams that need everything.",
    features: [
      "Unlimited projects",
      "Unlimited team seats",
      "Priority support",
      "Advanced analytics & exports",
    ],
  },
];

export default function PricingPage() {
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
        <SectionHeading
          eyebrow="Pricing"
          title="Simple pricing, no surprises"
          subtitle="This Lite version is free. The tiers below are the paid kit — same code, plus billing, future updates and support."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TIERS.map((t) => (
            <Card key={t.name} className="flex flex-col p-6">
              <h3 className="text-lg font-semibold text-slate-900">{t.name}</h3>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {t.price}
                {t.name === "Free" ? null : (
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
                {t.name === "Free" ? (
                  <Button href="/auth/signup" className="w-full">
                    Start free
                  </Button>
                ) : (
                  <Button href={PAID_KIT_URL} className="w-full">
                    Get the paid kit →
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-slate-500">
          Lite is free under the MIT license. The paid kit adds Polar and
          Stripe checkout with verified webhooks, future updates to this
          version (Pro), and email support — and a 14-day money-back
          guarantee.
        </p>
      </main>
    </div>
  );
}
