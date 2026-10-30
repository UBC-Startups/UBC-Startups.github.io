import { createElement, type HTMLAttributes } from "react";

const headingVariants = {
  "display-xl": "text-display-xl",
  "display-m": "text-display-m",
  "display-s": "text-display-s",
  "heading-xl": "text-heading-xl",
  "heading-m": "text-heading-m",
  "heading-s": "text-heading-s",
  "page-title": "text-page-title",
  "newsletter-title": "text-newsletter-title",
} as const;

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  variant?: keyof typeof headingVariants;
};

export function Heading({ as = "h2", variant = "heading-xl", className, ...props }: HeadingProps) {
  return createElement(as, { ...props, className: ["m-0 font-brand", headingVariants[variant], className].filter(Boolean).join(" ") });
}

const textVariants = {
  "body-xl": "text-body-xl", "body-l": "text-body-l", "body-m": "text-body-m", "body-s": "text-body-s",
  "label-l": "text-label-l", "label-m": "text-label-m", "label-s": "text-label-s", caption: "text-caption",
  eyebrow: "text-eyebrow", "page-subtitle": "text-page-subtitle",
} as const;

type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  as?: "p" | "span";
  variant?: keyof typeof textVariants;
};

export function Text({ as = "p", variant = "body-m", className, ...props }: TextProps) {
  return createElement(as, { ...props, className: ["m-0 font-brand", textVariants[variant], className].filter(Boolean).join(" ") });
}
