import Stripe from "stripe";
import { PLANS, type BillingPlan } from "@/lib/polar";

/**
 * Stripe billing — the second checkout option next to Polar.
 *
 * Unlike Polar (a merchant of record), Stripe is a payment
 * processor: the seller connects their own Stripe account and
 * Stripe pays out to the seller's own bank. That is why the kit
 * offers both — a buyer who already has Stripe keeps it, a buyer
 * who wants tax handled for them uses Polar (see README § Billing).
 *
 * No Stripe products are pre-created. Checkout uses inline
 * `price_data` (amount + currency + plan name), so the seller only
 * needs the two keys below — no product setup in the Stripe
 * dashboard. The plan is carried in the Checkout Session metadata,
 * and the webhook at /api/webhooks/stripe reads it back to activate
 * the plan (see src/app/api/webhooks/stripe/route.ts).
 *
 * Nothing is hard-coded here. All values come from env vars
 * (see .env.example). If the env vars are missing, checkout
 * returns a clear error instead of silently failing — exactly
 * like Polar does.
 */

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error(
      "Stripe is not configured: set STRIPE_SECRET_KEY in .env (see README § Billing).",
    );
  }
  return new Stripe(key);
}

/**
 * Create a Stripe Checkout session for a one-time plan purchase.
 * Returns the hosted checkout URL. Throws a plain Error with a
 * human-readable message on misconfiguration or on a Stripe
 * error — the API route surfaces it.
 */
export async function createStripeCheckout(
  plan: BillingPlan,
  customerEmail?: string,
): Promise<string> {
  const stripe = getStripe();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customerEmail || undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: PLANS[plan].priceUsd * 100, // Stripe takes cents
          product_data: {
            name: `SaaS Starter — ${PLANS[plan].name} plan`,
            description: "One-time payment for the SaaS Starter Kit.",
          },
        },
      },
    ],
    metadata: { plan },
    success_url: `${appUrl}/dashboard/billing?checkout=success&provider=stripe`,
    cancel_url: `${appUrl}/pricing?checkout=cancelled`,
  });
  if (!session.url) throw new Error("Stripe checkout succeeded but returned no URL.");
  return session.url;
}

/** Map a Stripe Checkout Session's metadata back to a plan. */
export function getPlanFromStripeMetadata(
  metadata: Record<string, string> | null | undefined,
): BillingPlan | null {
  const plan = metadata?.plan;
  return plan === "starter" || plan === "pro" ? plan : null;
}
