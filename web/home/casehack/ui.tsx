import Link from "next/link";
import type { ReactNode } from "react";

/** CaseHack button (Figma "CH / Button"): mint = primary, ghost = secondary on dark. */
const buttonVariants = {
  mint: "border-casehack-mint bg-casehack-mint text-casehack-forest hover:bg-casehack-mint-bright hover:border-casehack-mint-bright",
  ghost: "border-casehack-mint bg-transparent text-casehack-mint hover:bg-casehack-mint/10",
} as const;

type ChButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: keyof typeof buttonVariants;
  className?: string;
};

export function ChButton({ children, href, variant = "mint", className }: ChButtonProps) {
  const classes = [
    "inline-flex items-center justify-center rounded-[4px] border border-solid px-[22px] py-[14px] font-mono text-[14px] font-bold tracking-[0.04em] whitespace-nowrap no-underline transition-colors duration-200",
    buttonVariants[variant],
    className,
  ].filter(Boolean).join(" ");
  if (!href) {
    return <span aria-disabled="true" className={`${classes} cursor-not-allowed opacity-60`}>{children}</span>;
  }
  if (href.startsWith("/") || href.startsWith("#")) return <Link href={href} className={classes}>{children}</Link>;
  return <a href={href} target="_blank" rel="noreferrer" className={classes}>{children}</a>;
}

/** Sign-up button that falls back to a disabled "coming soon" state until a real link exists. */
export function SignUpButton({ href, className }: { href?: string; className?: string }) {
  return <ChButton href={href} className={className}>{href ? "SIGN UP →" : "SIGN-UP LINK COMING SOON"}</ChButton>;
}

/** CaseHack terminal tag (Figma "CH / Tag"). */
export function ChTag({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center rounded-[4px] border border-solid border-casehack-line bg-casehack-forest-raised px-[10px] py-[6px] font-mono text-[12px] font-medium tracking-[0.06em] whitespace-nowrap text-casehack-paper">{children}</span>;
}

/** Section eyebrow (Figma "CH / Label"): mono, mint, prefixed with //. */
export function ChLabel({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[13px] font-medium tracking-[0.12em] text-casehack-mint">{children}</p>;
}

/** Small mono field label used across cards. */
export function FieldLabel({ children, className = "text-casehack-mint-dim" }: { children: ReactNode; className?: string }) {
  return <p className={`font-mono text-[11px] font-medium tracking-[0.1em] ${className}`}>{children}</p>;
}

export function SectionHeading({ id, top, bottom, accentBottom = false }: { id?: string; top: string; bottom?: string; accentBottom?: boolean }) {
  return <h2 id={id} className="font-mono text-[clamp(32px,3.2vw,40px)] leading-[1.15] font-bold tracking-[-0.03em] text-casehack-paper">
    {top}
    {bottom && <><br /><span className={accentBottom ? "text-casehack-mint" : undefined}>{bottom}</span></>}
  </h2>;
}

/** Row of square "pixels"; the first `lit` are filled. */
export function PixelBar({ lit, total, size = 14, label }: { lit: number; total: number; size?: number; label: string }) {
  return <div role="img" aria-label={label} className="flex flex-wrap gap-[4px]">
    {Array.from({ length: total }, (_, i) => (
      <span key={i} aria-hidden="true" style={{ width: size, height: size }} className={i < lit ? "bg-casehack-mint" : "bg-casehack-line"} />
    ))}
  </div>;
}