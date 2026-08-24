import React from "react";

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-lg animate-enter">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200/90 w-full ${className}`}
    >
      {children}
    </div>
  );
}

export function DialogHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mb-5 ${className}`}>{children}</div>;
}

export function DialogTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-xl font-extrabold tracking-tight text-[var(--text-primary)] ${className}`}>
      {children}
    </h2>
  );
}

export function DialogDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-xs text-[var(--text-tertiary)] mt-1.5 leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

export function DialogFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5 ${className}`}>
      {children}
    </div>
  );
}
