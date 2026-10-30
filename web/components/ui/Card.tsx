import { createElement, type HTMLAttributes } from "react";

const paddingClasses = { none: "p-0", compact: "p-xs", comfortable: "p-lg" } as const;

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article";
  padding?: keyof typeof paddingClasses;
};

export function Card({ as = "div", padding = "comfortable", className, ...props }: CardProps) {
  return createElement(as, { ...props, className: [
    "box-border w-full rounded-card bg-surface", paddingClasses[padding], className,
  ].filter(Boolean).join(" ") });
}
