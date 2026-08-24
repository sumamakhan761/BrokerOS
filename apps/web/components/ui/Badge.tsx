import React from "react";

export function Badge({
  children,
  variant = "default",
  dot = false,
  className = "",
}: {
  children: React.ReactNode;
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "brand"
    | "gold";
  dot?: boolean;
  className?: string;
}) {
  const styles = {
    default: "bg-slate-100 text-slate-700 border-slate-200/80",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    warning: "bg-amber-50 text-amber-800 border-amber-200/80",
    danger: "bg-rose-50 text-rose-700 border-rose-200/80",
    info: "bg-sky-50 text-sky-700 border-sky-200/80",
    brand: "bg-purple-50 text-purple-700 border-purple-200/80",
    gold: "bg-amber-50 text-amber-900 border-amber-300",
  };

  const dotColors = {
    default: "bg-slate-400",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-sky-500",
    brand: "bg-purple-500",
    gold: "bg-amber-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight border ${styles[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} inline-block flex-shrink-0`}
        />
      )}
      {children}
    </span>
  );
}
