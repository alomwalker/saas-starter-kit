import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

// Optional privacy-friendly analytics (Plausible). Off by default:
// the script is only injected when the buyer sets
// NEXT_PUBLIC_PLAUSIBLE_DOMAIN to their own domain (see README §
// Analytics). Nothing is tracked on the demo.
//
// A plain <script defer> (Plausible's own snippet) rather than
// next/script, so the tag is visible in the served HTML and the
// buyer can verify it with view-source.
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {plausibleDomain ? (
          <script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
          />
        ) : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
