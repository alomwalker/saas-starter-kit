"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

/**
 * "Get notified at launch" form on the landing page.
 * Posts to /api/waitlist; the signup is stored in the database
 * and listed on the dashboard. No email is sent to the signup.
 */
export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "busy" || state === "done") return;
    setState("busy");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setState("done");
        setMessage("You're on the list — we'll email you at launch.");
      } else {
        setState("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (state === "done") {
    return (
      <p className="mx-auto mt-6 max-w-md rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-6 max-w-md">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (optional)"
          aria-label="Name (optional)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <Button type="submit" disabled={state === "busy"} className="shrink-0">
          {state === "busy" ? "Joining…" : "Notify me"}
        </Button>
      </div>
      {state === "error" && message ? (
        <p className="mt-2 text-sm text-red-600">{message}</p>
      ) : null}
      <p className="mt-2 text-xs text-slate-500">
        One email at launch, nothing else. No spam, no sharing your address.
      </p>
    </form>
  );
}
