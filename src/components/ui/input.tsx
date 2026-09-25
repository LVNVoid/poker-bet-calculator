import React from "react";
import { cn } from "@/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full h-11 px-3 text-sm bg-surface-muted border border-border rounded-xl text-primary placeholder:text-muted focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus transition-colors",
            error && "border-crimson focus:border-crimson focus:ring-crimson",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-crimson font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
