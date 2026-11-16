"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Per-customer delete button with a two-click confirm step:
 * first click arms it ("Sure?"), second click deletes, and a
 * Cancel link disarms it. No accidental deletes from one click.
 */
export default function DeleteCustomerButton({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/customers?id=${encodeURIComponent(customerId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Could not delete this customer.");
        setArmed(false);
      }
    } catch {
      setError("Could not delete this customer.");
      setArmed(false);
    } finally {
      setBusy(false);
    }
  }

  if (armed) {
    return (
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {busy ? "Deleting…" : "Sure?"}
        </button>
        <button
          type="button"
          onClick={() => setArmed(false)}
          className="text-xs text-slate-500 hover:text-slate-900"
        >
          Cancel
        </button>
        {error ? <span className="text-xs text-red-600">{error}</span> : null}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setArmed(true)}
      aria-label={`Delete ${customerName}`}
      className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-red-300 hover:text-red-600"
    >
      Delete
    </button>
  );
}
