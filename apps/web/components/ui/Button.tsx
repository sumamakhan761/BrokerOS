import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "luxury";
  size?: "default" | "sm" | "lg" | "icon";
  static?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "default",
      size = "default",
      static: isStatic = false,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ";

    const tapScale = !isStatic ? "active:scale-[0.96] " : "";

    let variantStyles = "";
    if (variant === "default") {
      variantStyles =
        "bg-[var(--brand-600)] text-white shadow-sm hover:bg-[var(--brand-700)] shadow-purple-600/20 ";
    } else if (variant === "secondary") {
      variantStyles =
        "bg-slate-100 text-[var(--text-primary)] hover:bg-slate-200/80 ";
    } else if (variant === "outline") {
      variantStyles =
        "border border-slate-200 bg-white text-[var(--text-secondary)] hover:bg-slate-50 hover:text-[var(--text-primary)] shadow-xs ";
    } else if (variant === "ghost") {
      variantStyles =
        "text-[var(--text-secondary)] hover:bg-slate-100 hover:text-[var(--text-primary)] ";
    } else if (variant === "danger") {
      variantStyles =
        "bg-rose-600 text-white shadow-sm hover:bg-rose-700 shadow-rose-600/20 ";
    } else if (variant === "luxury") {
      variantStyles =
        "bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md shadow-purple-900/25 hover:opacity-95 ";
    }

    let sizeStyles = "";
    if (size === "default") sizeStyles = "h-9 px-4 py-2 text-xs ";
    if (size === "sm") sizeStyles = "h-8 px-3 text-[11px] rounded-lg ";
    if (size === "lg") sizeStyles = "h-11 px-6 text-sm rounded-xl ";
    if (size === "icon") sizeStyles = "h-9 w-9 p-0 rounded-xl ";

    return (
      <button
        ref={ref}
        className={`${baseStyles}${tapScale}${variantStyles}${sizeStyles}${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
