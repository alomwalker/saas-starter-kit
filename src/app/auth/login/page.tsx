import LoginForm from "./LoginForm";

/**
 * Server wrapper for the login form: it reads the server-only env
 * vars and tells the client form which sign-in options actually
 * exist, so a button is never shown for a provider the seller
 * has not configured. Google appears only with AUTH_GOOGLE_ID +
 * AUTH_GOOGLE_SECRET; the magic link only with RESEND_API_KEY.
 * Credentials (email + password) are always on.
 *
 * This page is force-dynamic on purpose: the env vars are runtime
 * config, and a statically prerendered page would bake in whatever
 * the keys were at build time — a seller who adds Google/Resend
 * keys after deploying would never see the buttons.
 */
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const googleEnabled = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );
  const emailEnabled = Boolean(process.env.RESEND_API_KEY?.trim());
  return <LoginForm googleEnabled={googleEnabled} emailEnabled={emailEnabled} />;
}
