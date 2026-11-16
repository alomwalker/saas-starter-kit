"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { Button, Card } from "@/components/ui";

function LoginForm({
  googleEnabled,
  emailEnabled,
}: {
  googleEnabled: boolean;
  emailEnabled: boolean;
}) {
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const verify = params.get("verify");
  const authError = params.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Magic link state
  const [magicEmail, setMagicEmail] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [magicBusy, setMagicBusy] = useState(false);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotDone, setForgotDone] = useState<string | null>(null);
  const [forgotBusy, setForgotBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setBusy(false);
    if (!result || result.error) {
      setError("Invalid email or password.");
      return;
    }
    window.location.href = next;
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMagicBusy(true);
    const result = await signIn("resend", { email: magicEmail, redirect: false });
    setMagicBusy(false);
    if (!result || result.error) {
      setError("Could not send the sign-in link. Check the email address and try again.");
      return;
    }
    setMagicSent(true);
  }

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    setForgotBusy(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    });
    const data = (await res.json()) as { emailConfigured?: boolean; error?: string };
    setForgotBusy(false);
    if (!res.ok) {
      setForgotDone(data.error || "Could not request a reset link.");
      return;
    }
    setForgotDone(
      data.emailConfigured
        ? "If an account exists for that email, a reset link is on its way. It expires in 1 hour."
        : "Email is not configured on this site yet, so no reset link could be sent. Ask the site owner to set RESEND_API_KEY.",
    );
  }

  return (
    <Card className="w-full max-w-md p-8">
      <h1 className="text-2xl font-bold text-slate-900">Log in</h1>
      <p className="mt-1 text-sm text-slate-600">
        Log in with the account you created. Passwords are checked against
        your database — there is no demo account.
      </p>
      {verify === "ok" ? (
        <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          Email verified — you can log in now.
        </p>
      ) : null}
      {verify === "invalid" ? (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          That verification link is invalid or has expired.
        </p>
      ) : null}
      {authError === "OAuthAccountNotLinked" ? (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          An account with this email already exists with a password. Log in
          with your password instead — Google sign-in can&apos;t take over an
          existing account.
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
      ) : null}

      {googleEnabled ? (
        <>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: next })}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span aria-hidden="true">G</span> Continue with Google
          </button>
          <div className="mt-6 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or log in with email
            <span className="h-px flex-1 bg-slate-200" />
          </div>
        </>
      ) : null}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <Button className="w-full py-2.5" variant="primary">
          {busy ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => setShowForgot((v) => !v)}
          className="text-sm text-brand-600 hover:underline"
        >
          Forgot password?
        </button>
      </div>
      {showForgot ? (
        <form onSubmit={requestReset} className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <label className="block text-sm font-medium text-slate-700">
            Email for the reset link
            <input
              type="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            />
          </label>
          <Button className="w-full py-2" variant="secondary">
            {forgotBusy ? "Sending…" : "Email me a reset link"}
          </Button>
          {forgotDone ? <p className="text-sm text-slate-700">{forgotDone}</p> : null}
        </form>
      ) : null}

      {emailEnabled ? (
        <div className="mt-6 border-t border-slate-200 pt-5">
          {magicSent ? (
            <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
              Check your inbox — a sign-in link is on its way to {magicEmail}.
              It expires in 24 hours.
            </p>
          ) : (
            <form onSubmit={sendMagicLink} className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Or email me a sign-in link — no password needed
                <input
                  type="email"
                  required
                  value={magicEmail}
                  onChange={(e) => setMagicEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <Button className="w-full py-2" variant="secondary">
                {magicBusy ? "Sending…" : "Email me a sign-in link"}
              </Button>
            </form>
          )}
        </div>
      ) : null}

      <p className="mt-6 text-center text-sm text-slate-600">
        No account? <a href="/auth/signup" className="text-brand-600 hover:underline">Sign up</a>
      </p>
    </Card>
  );
}

export default function LoginPage({
  googleEnabled,
  emailEnabled,
}: {
  googleEnabled: boolean;
  emailEnabled: boolean;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Suspense>
        <LoginForm googleEnabled={googleEnabled} emailEnabled={emailEnabled} />
      </Suspense>
    </div>
  );
}
