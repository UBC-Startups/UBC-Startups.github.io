import type { CSSProperties, ReactNode } from "react";
import { Text } from "../components/ui";
import styles from "./ui.module.css";

export function SectionLabel({ label, showIcon = true }: { label: string; showIcon?: boolean }) {
  return <div className="flex items-center gap-xs">{showIcon && <span className={styles.plus} aria-hidden="true" />}<Text variant="label-m">{label}</Text></div>;
}

export function Glow({ $inset, style, children }: { $inset: string; style?: CSSProperties; children: ReactNode }) {
  return <div className={styles.glow} style={{ ...style, "--glow-inset": $inset } as CSSProperties}>{children}</div>;
}
