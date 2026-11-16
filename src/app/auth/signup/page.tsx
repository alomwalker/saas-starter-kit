"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button, Card } from "@/components/ui";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setBusy(false);
      setError(data.error || "Signup failed.");
      return;
    }
    // Account created in the database — now sign in with it.
    const result = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (!result || result.error) {
      setError("Account created — please log in with your new email and password.");
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-600">
          Creates a real account in your database — your password is stored
          as a bcrypt hash, never in plain text.
        </p>
        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
        ) : null}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input required value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input type="password" required minLength={8} value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <Button className="w-full py-2.5">{busy ? "Creating…" : "Create account"}</Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account? <a href="/auth/login" className="text-brand-600 hover:underline">Log in</a>
        </p>
      </Card>
    </div>
  );
}
