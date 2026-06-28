import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-lg",
        {
          "bg-surface-100 text-surface-600": variant === "default",
          "bg-accent-50 text-accent-700": variant === "success",
          "bg-warning-50 text-warning-700": variant === "warning",
          "bg-danger-50 text-danger-600": variant === "danger",
          "bg-brand-50 text-brand-700": variant === "info",
        },
        {
          "px-2 py-0.5 text-xs": size === "sm",
          "px-2.5 py-1 text-sm": size === "md",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
