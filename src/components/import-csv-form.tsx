"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

/**
 * "Import CSV" on the dashboard — reads a CSV file in the browser
 * (columns: name,email,plan) and sends the parsed rows to
 * POST /api/customers/import. The server validates every row:
 * valid rows are created, invalid or duplicate rows are skipped
 * with a reason, and duplicates are never overwritten.
 */
type ImportResult = {
  ok?: boolean;
  created?: number;
  skipped?: Array<{ row: string; reason: string }>;
  error?: string;
};

/** Minimal CSV parser: handles quoted fields, embedded commas and CRLF. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((c) => c.trim() !== "")) rows.push(row);
  }
  return rows;
}

export default function ImportCsvForm() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy">("idle");
  const [message, setMessage] = useState("");
  const [skipped, setSkipped] = useState<Array<{ row: string; reason: string }>>([]);

  async function onFile(file: File | undefined) {
    if (!file || state === "busy") return;
    setState("busy");
    setMessage("");
    setSkipped([]);
    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      if (parsed.length < 2) {
        setMessage("That file has no data rows — it needs a header (name,email,plan) plus at least one row.");
        setState("idle");
        return;
      }
      const header = parsed[0].map((h) => h.trim().toLowerCase());
      const nameIdx = header.indexOf("name");
      const emailIdx = header.indexOf("email");
      const planIdx = header.indexOf("plan");
      if (nameIdx === -1 || emailIdx === -1 || planIdx === -1) {
        setMessage("The header must have name, email and plan columns.");
        setState("idle");
        return;
      }
      const rows = parsed.slice(1).map((r) => ({
        name: r[nameIdx] ?? "",
        email: r[emailIdx] ?? "",
        plan: r[planIdx] ?? "",
      }));
      const res = await fetch("/api/customers/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = (await res.json()) as ImportResult;
      if (res.ok && data.ok) {
        const created = data.created ?? 0;
        const skippedRows = data.skipped ?? [];
        setSkipped(skippedRows);
        setMessage(
          `Imported ${created} customer${created === 1 ? "" : "s"}` +
            (skippedRows.length > 0
              ? `, skipped ${skippedRows.length} (see below).`
              : "."),
        );
        router.refresh();
      } else {
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setMessage("Something went wrong reading that file. Please try again.");
    } finally {
      setState("idle");
    }
  }

  return (
    <div className="border-b border-slate-200 px-6 py-4">
      <label className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
        <span className="font-medium text-slate-700">Import CSV</span>
        <input
          type="file"
          accept=".csv,text/csv"
          aria-label="Import customers CSV"
          disabled={state === "busy"}
          onChange={(e) => void onFile(e.target.files?.[0])}
          className="text-sm text-slate-600"
        />
        <span className="text-slate-500">Columns: name, email, plan (free / starter / pro).</span>
      </label>
      {message ? (
        <p className="mt-2 text-sm text-slate-700">{message}</p>
      ) : null}
      {skipped.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-slate-600">
          {skipped.map((s) => (
            <li key={s.row}>
              {s.row} — {s.reason}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-2 text-xs text-slate-500">
        Duplicates (an email that already exists) are skipped, never overwritten.
      </p>
    </div>
  );
}
