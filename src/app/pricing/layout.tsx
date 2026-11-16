import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "SaaS Starter Lite is free under the MIT license. The paid kit is $29 Starter / $49 Pro, one-time, with Polar and Stripe checkout.",
};

export default function PricingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
