import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
        {
          "bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-200 hover:shadow-lg hover:shadow-brand-200":
            variant === "primary",
          "bg-surface-800 text-white hover:bg-surface-900 shadow-md":
            variant === "secondary",
          "border-2 border-surface-300 bg-white text-surface-700 hover:bg-surface-50 hover:border-surface-400":
            variant === "outline",
          "text-surface-600 hover:bg-surface-100 hover:text-surface-800":
            variant === "ghost",
          "bg-danger-500 text-white hover:bg-danger-600 shadow-md shadow-danger-200":
            variant === "danger",
        },
        {
          "px-3 py-1.5 text-sm": size === "sm",
          "px-5 py-2.5 text-sm": size === "md",
          "px-6 py-3 text-base": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
