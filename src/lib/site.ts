/**
 * Site-wide constants. The demo URL is the default canonical origin;
 * sellers change NEXT_PUBLIC_APP_URL in .env for their own domain.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://saas-starter-kit-puce.vercel.app";

export const SITE_NAME = "SaaS Starter";
export const SITE_TAGLINE = "Ship your SaaS in days, not months";
export const SITE_DESCRIPTION =
  "A production-ready Next.js SaaS starter kit: landing page, auth, dashboard, and billing wired for Polar or Stripe. Clone it, brand it, launch it.";
