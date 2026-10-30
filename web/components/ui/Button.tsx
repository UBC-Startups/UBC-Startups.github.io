import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithRef, ReactNode } from "react";

const variants = {
  primary: "border-inverse bg-inverse text-ink-inverse hover:bg-inverse-subtle",
  secondary: "border-surface bg-surface text-ink hover:bg-canvas",
  outline: "border-ink-inverse bg-transparent text-ink-inverse hover:bg-surface/10",
} as const;

type CommonProps = {
  children: ReactNode;
  variant?: keyof typeof variants;
  showDot?: boolean;
};
export type ButtonProps = CommonProps & (
  | ({ href: string } & ComponentPropsWithRef<"a">)
  | ({ href?: never } & ComponentPropsWithRef<"button">)
);

function classes(variant: keyof typeof variants, showDot: boolean, className?: string) {
  return [
    "inline-flex shrink-0 items-center justify-center gap-xs rounded-pill border border-solid font-brand text-label-m whitespace-nowrap no-underline cursor-pointer transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    "py-button-y",
    showDot ? "pl-lg pr-md" : "px-lg",
    variants[variant],
    className,
  ].filter(Boolean).join(" ");
}

function Content({ children, showDot }: Pick<CommonProps, "children" | "showDot">) {
  return <>{children}{showDot && <Image src="/figma/button-dot.svg" alt="" width={7} height={7} />}</>;
}

/** Use href for navigation and native button props for actions/submission. */
export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { children, variant = "primary", showDot = false, className, href, ...anchor } = props;
    const classNames = classes(variant, showDot, className);
    const content = <Content showDot={showDot}>{children}</Content>;
    if (href.startsWith("/") || href.startsWith("#")) {
      return <Link {...anchor} href={href} className={classNames}>{content}</Link>;
    }
    return <a target="_blank" rel="noreferrer" {...anchor} href={href} className={classNames}>{content}</a>;
  }
  const { children, variant = "primary", showDot = false, className, type = "button", ...button } = props;
  return <button {...button} type={type} className={classes(variant, showDot, className)}><Content showDot={showDot}>{children}</Content></button>;
}
