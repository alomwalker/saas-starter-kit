import type { Metadata } from "next";
import { Button, Card, SectionHeading } from "@/components/ui";
import { SITE_NAME } from "@/lib/site";

/**
 * Public showcase (leaderboard): products shipped with this kit.
 * There are no buyers yet, so this page is an honest empty state —
 * no invented products, no invented revenue. Listings are added
 * manually by the seller after review (see SHOWCASE.md in the repo
 * root); there is no submission form that writes to the database.
 */

export const metadata: Metadata = {
  title: "Showcase — products shipped with this kit",
  description:
    "Products built and shipped with SaaS Starter. No products listed yet — be the first.",
  openGraph: {
    title: "Showcase — products shipped with SaaS Starter",
    description:
      "Products built and shipped with SaaS Starter. No products listed yet — be the first.",
    type: "website",
  },
};

export default function ShowcasePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <img src="/icon.svg" alt="" className="h-5 w-5" />
            {SITE_NAME}
          </a>
          <a href="/" className="text-sm text-slate-600 hover:text-slate-900">
            ← Back home
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading
          eyebrow="Showcase"
          title="Products shipped with this kit"
          subtitle="Real products, built by real buyers — each one reviewed before it appears here."
        />

        <div className="mx-auto mt-10 max-w-2xl">
          <Card className="p-8 text-center">
            <p className="text-lg font-semibold text-slate-900">
              No shipped products listed yet — be the first.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              This kit launched in November 2026 and the first buyers are
              still building. When they ship, their products go here — with
              their permission, and only after review.
            </p>
          </Card>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <Card className="p-8">
            <h2 className="font-semibold text-slate-900">How to get listed</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm leading-relaxed text-slate-600">
              <li>
                Buy the kit and ship something with it — anything from a
                landing page to a full SaaS.
              </li>
              <li>
                Email{" "}
                <a
                  href="mailto:alomwalker21@gmail.com?subject=Showcase%20listing%20—%20SaaS%20Starter"
                  className="font-medium text-brand-600 hover:underline"
                >
                  alomwalker21@gmail.com
                </a>{" "}
                with your product name, its URL, and — only if you want to
                share it — your monthly revenue.
              </li>
              <li>
                We check the product is real and live, then list it here with
                your name and link. Listings are reviewed before appearing;
                nothing is published automatically.
              </li>
            </ol>
            <p className="mt-4 text-sm text-slate-500">
              Revenue figures are optional and always shown exactly as the
              maker reports them — never estimated, never invented.
            </p>
            <div className="mt-6">
              <Button href="/pricing">Get the kit →</Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
