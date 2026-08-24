import React, { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`bg-white border ${
            error
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15"
              : "border-slate-200 focus:border-[var(--brand-600)] focus:ring-purple-500/15"
          } rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-[var(--text-primary)] outline-none transition-all focus:ring-2 shadow-xs cursor-pointer ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-[11px] font-medium text-rose-600">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
