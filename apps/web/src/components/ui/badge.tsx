import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "outline" | "success" | "muted";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const baseStyles =
  "inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em]";

const variants: Record<BadgeVariant, string> = {
  default:
    "border-[var(--app-link-hover)] bg-[var(--app-foreground)] text-[var(--app-background)]",
  outline:
    "border-[var(--app-border)] bg-transparent text-[var(--app-foreground)]",
  success: "border-emerald-600/60 bg-transparent text-emerald-400",
  muted: "border-[var(--app-border)] bg-transparent text-[var(--app-muted)]",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    />
  );
}
