/**
 * Polar billing — merchant of record.
 *
 * Why Polar: Stripe and PayPal do not accept sellers in Bangladesh.
 * Polar is a merchant of record: it is the legal seller, handles
 * VAT/sales tax, and pays out to a Bangladeshi bank account
 * (5% + $0.50 per sale; payouts run through Stripe Connect — no
 * Payoneer option appeared when the account was set up on 2026-11-16).
 *
 * Nothing is hard-coded here. All values come from env vars
 * (see .env.example). If the env vars are missing, checkout
 * returns a clear error instead of silently failing.
 *
 * Flow:
 *   1. Seller creates a product in Polar (polar.sh) and copies its ID.
 *   2. Buyer clicks "Upgrade" -> POST /api/checkout { productId }
 *   3. This file creates a Polar checkout session and returns its URL.
 *   4. Buyer pays on Polar; the webhook at /api/webhooks/polar
 *      verifies the signature and marks the subscription active
 *      in your database (see src/app/api/webhooks/polar/route.ts).
 */

export type BillingPlan = "starter" | "pro";

export const PLANS: Record<
  BillingPlan,
  { name: string; priceUsd: number; productEnvKey: string; features: string[] }
> = {
  starter: {
    name: "Starter",
    priceUsd: 29,
    productEnvKey: "POLAR_PRODUCT_ID_STARTER",
    features: [
      "1 project, 3 team seats",
      "Dashboard + analytics",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    priceUsd: 49,
    productEnvKey: "POLAR_PRODUCT_ID_PRO",
    features: [
      "Unlimited projects",
      "Unlimited team seats",
      "Priority support",
      "Advanced analytics & exports",
    ],
  },
};

export function getPolarProductId(plan: BillingPlan): string | null {
  const value = process.env[PLANS[plan].productEnvKey];
  return value && value.trim().length > 0 ? value.trim() : null;
}

/** Map a Polar product ID back to a plan — used by the webhook. */
export function getPlanForProductId(productId: string | null | undefined): BillingPlan | null {
  if (!productId) return null;
  if (productId === getPolarProductId("starter")) return "starter";
  if (productId === getPolarProductId("pro")) return "pro";
  return null;
}

export function isPolarConfigured(): boolean {
  return Boolean(
    process.env.POLAR_ACCESS_TOKEN && getPolarProductId("pro"),
  );
}

type PolarCheckoutResponse = { url?: string };

/**
 * Create a Polar checkout session for a plan.
 * Throws a plain Error with a human-readable message on misconfiguration
 * or on a non-2xx response from Polar — the API route surfaces it.
 */
export async function createPolarCheckout(
  plan: BillingPlan,
  customerEmail?: string,
): Promise<string> {
  const token = process.env.POLAR_ACCESS_TOKEN;
  const productId = getPolarProductId(plan);
  if (!token) {
    throw new Error(
      "Polar is not configured: set POLAR_ACCESS_TOKEN in .env (see README § Billing).",
    );
  }
  if (!productId) {
    throw new Error(
      `Polar is not configured: set ${PLANS[plan].productEnvKey} in .env (see README § Billing).`,
    );
  }

  const res = await fetch("https://api.polar.sh/v1/checkouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      products: [productId],
      customer_email: customerEmail || undefined,
      success_url:
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}` +
        "/dashboard/billing?checkout=success",
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Polar checkout failed (${res.status}): ${detail.slice(0, 300)}`,
    );
  }

  const data = (await res.json()) as PolarCheckoutResponse;
  if (!data.url) throw new Error("Polar checkout succeeded but returned no URL.");
  return data.url;
}
