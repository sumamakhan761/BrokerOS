import React from "react";

export function Card({
  children,
  className = "",
  hoverable = true,
}: {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm ${hoverable ? "hover-lift" : ""
        } ${className}`}
    >
      {children}
    </div>
  );
}
