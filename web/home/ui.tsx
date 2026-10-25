import Link from "next/link";
import Image from "next/image";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import styles from "./ui.module.css";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  showDot?: boolean;
  to?: string;
  hash?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLElement>;
};

export function Button({ children, variant = "primary", showDot = false, to, hash, href, type = "button", onClick }: ButtonProps) {
  const className = `${styles.button} ${styles[variant]} ${showDot ? styles.withDot : ""}`;
  const content = <>{children}{showDot && <Image src="/figma/button-dot.svg" alt="" width={7} height={7} />}</>;
  const destination = hash ?? to ?? href;
  if (destination?.startsWith("/") || destination?.startsWith("#")) {
    return <Link href={destination} className={className} onClick={onClick}>{content}</Link>;
  }
  if (destination) return <a href={destination} target="_blank" rel="noreferrer" className={className} onClick={onClick}>{content}</a>;
  return <button type={type} className={className} onClick={onClick}>{content}</button>;
}

export function SectionLabel({ label, showIcon = true }: { label: string; showIcon?: boolean }) {
  return <div className={styles.label}>{showIcon && <span className={styles.plus} aria-hidden="true" />}<p>{label}</p></div>;
}

export function Glow({ $inset, style, children }: { $inset: string; style?: CSSProperties; children: ReactNode }) {
  return <div className={styles.glow} style={{ ...style, "--glow-inset": $inset } as CSSProperties}>{children}</div>;
}
