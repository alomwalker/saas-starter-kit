"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { Button, Card } from "@/components/ui";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  return (
    <Card className="w-full max-w-md p-8">
      <h1 className="text-2xl font-bold text-slate-900">Log in</h1>
      <p className="mt-1 text-sm text-slate-600">
        Log in with the account you created. Passwords are checked against
        your database — there is no demo account.
      </p>
      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
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
      <p className="mt-4 text-center text-sm text-slate-600">
        No account? <a href="/auth/signup" className="text-brand-600 hover:underline">Sign up</a>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
