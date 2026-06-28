import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-surface-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-surface-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none",
              icon && "pl-10",
              error && "border-danger-300 focus:border-danger-500 focus:ring-danger-100",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-danger-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
