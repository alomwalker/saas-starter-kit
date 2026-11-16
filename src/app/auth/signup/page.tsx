import type { Metadata } from "next";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Sign up",
  description:
    "Create your SaaS Starter account — free, no card required. Your account lives in your own database.",
};

/**
 * Server wrapper for the signup form: the "Continue with Google"
 * button is only shown when the seller configured Google OAuth
 * (AUTH_GOOGLE_ID + AUTH_GOOGLE_SECRET). Email + password signup
 * is always on.
 *
 * Force-dynamic for the same reason as the login page: the env
 * vars are runtime config, and a static prerender would bake in
 * the build-time key state.
 */
export const dynamic = "force-dynamic";

export default function SignupPage() {
  const googleEnabled = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );
  return <SignupForm googleEnabled={googleEnabled} />;
}
