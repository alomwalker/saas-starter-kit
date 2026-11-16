import type { ReactNode } from "react";

export function Button({
  children,
  href,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  // Only used when rendering a <button> (no href): forms use
  // type="submit"; disabled greys the button out while submitting.
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const styles =
    variant === "primary"
      ? "bg-brand-600 text-white hover:bg-brand-700"
      : variant === "secondary"
        ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
        : "text-slate-700 hover:bg-slate-100";
  const cls = `inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition ${styles} ${disabled ? "cursor-not-allowed opacity-60" : ""} ${className}`;
  return href ? (
    <a href={href} className={cls}>{children}</a>
  ) : (
    <button type={type} disabled={disabled} className={cls}>{children}</button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "green" | "amber" | "brand";
}) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    brand: "bg-brand-100 text-brand-700",
  } as const;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
      {subtitle ? <p className="mt-3 text-lg text-slate-600">{subtitle}</p> : null}
    </div>
  );
}
