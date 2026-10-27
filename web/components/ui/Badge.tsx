import type { HTMLAttributes } from "react";

const variants = {
  accent: "bg-event-tag text-ink-inverse",
  surface: "bg-surface text-ink",
} as const;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants };

export function Badge({ variant = "accent", className, ...props }: BadgeProps) {
  return <span {...props} className={[
    "inline-block rounded-pill px-sm py-badge-y font-brand text-badge whitespace-nowrap shadow-badge",
    variants[variant], className,
  ].filter(Boolean).join(" ")} />;
}
