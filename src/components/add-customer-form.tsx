"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

/** "Add customer" form on the dashboard — creates a real Customer row. */
export default function AddCustomerForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("free");
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "busy") return;
    setState("busy");
    setMessage("");
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, plan }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setName("");
        setEmail("");
        setPlan("free");
        setState("idle");
        router.refresh();
      } else {
        setState("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={submit} className="border-b border-slate-200 px-6 py-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Customer name"
          aria-label="Customer name"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="customer@example.com"
          aria-label="Customer email"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          aria-label="Plan"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
        </select>
        <Button type="submit" disabled={state === "busy"} className="shrink-0">
          {state === "busy" ? "Adding…" : "Add customer"}
        </Button>
      </div>
      {state === "error" && message ? (
        <p className="mt-2 text-sm text-red-600">{message}</p>
      ) : null}
    </form>
  );
}
