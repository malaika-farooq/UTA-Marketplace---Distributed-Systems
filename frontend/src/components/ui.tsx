import React from "react";

export function cn(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-3xl border bg-white shadow-soft", className)}>
      {children}
    </div>
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99]";
  const styles =
    variant === "primary"
      ? "bg-uta-blue text-white hover:brightness-110 shadow-glow"
      : variant === "secondary"
      ? "bg-uta-ice text-uta-navy hover:bg-blue-50 border border-blue-100"
      : "bg-transparent hover:bg-slate-100 text-slate-700";
  return <button className={cn(base, styles, className)} {...props} />;
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none",
        "focus:ring-4 focus:ring-blue-100 focus:border-blue-200",
        className
      )}
      {...props}
    />
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium text-slate-700">{children}</div>;
}

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", className)}>
      {children}
    </span>
  );
}