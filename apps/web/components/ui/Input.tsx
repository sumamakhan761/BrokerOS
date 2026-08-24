import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`bg-white border ${
            error
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15"
              : "border-slate-200 focus:border-[var(--brand-600)] focus:ring-purple-500/15"
          } rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-[var(--text-primary)] placeholder:text-slate-400 outline-none transition-all focus:ring-2 shadow-xs ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-[11px] font-medium text-rose-600">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[var(--text-muted)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
