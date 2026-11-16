import { NextResponse } from "next/server";
import { createPolarCheckout, type BillingPlan } from "@/lib/polar";
import { createStripeCheckout } from "@/lib/stripe";

export async function POST(req: Request) {
  const { plan, email, provider } = (await req.json()) as {
    plan?: string;
    email?: string;
    provider?: string;
  };
  if (plan !== "starter" && plan !== "pro") {
    return NextResponse.json(
      { error: "Unknown plan. Expected 'starter' or 'pro'." },
      { status: 400 },
    );
  }
  // Polar is the default (and the only provider this kit shipped with
  // before Stripe was added). Pass provider: "stripe" to check out
  // with Stripe instead.
  if (provider !== undefined && provider !== "polar" && provider !== "stripe") {
    return NextResponse.json(
      { error: "Unknown provider. Expected 'polar' or 'stripe'." },
      { status: 400 },
    );
  }
  try {
    const url =
      provider === "stripe"
        ? await createStripeCheckout(plan as BillingPlan, email)
        : await createPolarCheckout(plan as BillingPlan, email);
    return NextResponse.json({ url, provider: provider ?? "polar" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
