import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaaS Starter — Ship your SaaS in days, not months",
  description:
    "A production-ready Next.js SaaS starter kit: landing page, auth, dashboard, billing via Polar, and docs. Clone it, brand it, launch it.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
