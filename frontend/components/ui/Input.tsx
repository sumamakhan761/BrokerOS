import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none transition-all focus:border-[#6610f2] focus:ring-[3px] focus:ring-[#6610f2]/10 ${className}`}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';
