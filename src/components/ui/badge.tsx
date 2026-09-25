import React from "react";
import { cn } from "@/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "emerald" | "crimson" | "blue" | "purple";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-full select-none",
        size === "sm" && "text-[10px] px-2 py-0.5",
        size === "md" && "text-xs px-2.5 py-1",
        variant === "default" && "bg-surface-muted text-secondary border border-border",
        variant === "gold" && "bg-gold/20 text-gold border border-gold/40",
        variant === "emerald" && "bg-emerald/20 text-emerald border border-emerald/40",
        variant === "crimson" && "bg-crimson/20 text-crimson border border-crimson/40",
        variant === "blue" && "bg-blue/20 text-blue border border-blue/40",
        variant === "purple" && "bg-purple/20 text-purple border border-purple/40",
        className
      )}
      {...props}
    />
  );
}
