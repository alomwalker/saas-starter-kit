import { NextResponse } from "next/server";
import { createPolarCheckout, type BillingPlan } from "@/lib/polar";

export async function POST(req: Request) {
  const { plan, email } = (await req.json()) as {
    plan?: string;
    email?: string;
  };
  if (plan !== "starter" && plan !== "pro") {
    return NextResponse.json(
      { error: "Unknown plan. Expected 'starter' or 'pro'." },
      { status: 400 },
    );
  }
  try {
    const url = await createPolarCheckout(plan as BillingPlan, email);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
