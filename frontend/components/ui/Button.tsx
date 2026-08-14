import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    let baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 ';
    
    let variantStyles = '';
    if (variant === 'default') variantStyles = 'bg-slate-900 text-slate-50 shadow hover:bg-slate-900/90 ';
    if (variant === 'outline') variantStyles = 'border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 ';
    if (variant === 'ghost') variantStyles = 'hover:bg-slate-100 hover:text-slate-900 ';

    let sizeStyles = '';
    if (size === 'default') sizeStyles = 'h-9 px-4 py-2 ';
    if (size === 'sm') sizeStyles = 'h-8 rounded-md px-3 text-xs ';
    if (size === 'lg') sizeStyles = 'h-10 rounded-md px-8 ';
    if (size === 'icon') sizeStyles = 'h-9 w-9 ';

    return (
      <button
        ref={ref}
        className={`${baseStyles}${variantStyles}${sizeStyles}${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
