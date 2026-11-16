import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple one-time pricing for the SaaS Starter Kit: Free $0, Starter $29, Pro $49. Checkout via Polar or Stripe. 14-day money-back guarantee.",
};

export default function PricingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
