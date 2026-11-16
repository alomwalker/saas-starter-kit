"use client";

import { useState } from "react";
import { Card } from "@/components/ui";

export default function SettingsPage({
  initial,
}: {
  initial: { workspaceName: string; contactEmail: string };
}) {
  const [workspaceName, setWorkspaceName] = useState(initial.workspaceName);
  const [contactEmail, setContactEmail] = useState(initial.contactEmail);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(null);
    setBusy(true);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceName, contactEmail }),
    });
    const data = (await res.json()) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not save settings.");
      return;
    }
    setSaved("Settings saved — stored in your database.");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <p className="mt-1 text-slate-600">Workspace settings, saved to your database.</p>
      <Card className="mt-6 max-w-xl p-6">
        <h2 className="font-semibold text-slate-900">Workspace</h2>
        {saved ? (
          <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{saved}</p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
        ) : null}
        <form onSubmit={submit}>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Workspace name
            <input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Contact email
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save settings"}
          </button>
        </form>
      </Card>
    </div>
  );
}
