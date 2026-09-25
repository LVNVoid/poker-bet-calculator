import React from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline" | "ghost" | "gold";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100",
          // Sizes (touch-friendly targets >= 44px for md/lg)
          size === "sm" && "h-9 px-3 text-xs rounded-lg min-h-[36px]",
          size === "md" && "h-11 px-4 text-sm rounded-xl min-h-[44px]",
          size === "lg" && "h-14 px-6 text-base rounded-xl min-h-[52px]",
          size === "icon" && "h-11 w-11 rounded-xl min-h-[44px] min-w-[44px]",
          // Variants using CSS variables / theme tokens
          variant === "primary" &&
            "bg-blue hover:bg-blue-glow text-primary shadow-sm",
          variant === "secondary" &&
            "bg-surface-muted hover:bg-surface-card text-primary border border-border",
          variant === "success" &&
            "bg-emerald hover:bg-emerald-glow text-canvas shadow-sm",
          variant === "danger" &&
            "bg-crimson hover:bg-crimson-glow text-primary shadow-sm",
          variant === "gold" &&
            "bg-gold hover:bg-gold-glow text-canvas shadow-md font-bold",
          variant === "outline" &&
            "bg-transparent border border-border hover:bg-surface-muted text-primary",
          variant === "ghost" &&
            "bg-transparent hover:bg-surface-muted text-secondary hover:text-primary",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
