// Compatibility aliases for migrated interactive sections. Actual values live
// only in styles/tokens.css, shared by Tailwind, CSS Modules, and inline styles.
export const color = {
  canvas: "var(--color-canvas)",
  surface: "var(--color-surface)",
  inverse: "var(--color-inverse)",
  inverseSubtle: "var(--color-inverse-subtle)",
  muted: "var(--color-muted)",
  ink: "var(--color-ink)",
  inkSecondary: "var(--color-ink-secondary)",
  inkTertiary: "var(--color-ink-tertiary)",
  inkInverse: "var(--color-ink-inverse)",
  inkInverseMuted: "var(--color-ink-inverse-muted)",
  accent: "var(--color-accent)",
  red: "var(--color-brand-red)",
  green: "var(--color-brand-green)",
  charcoal: "var(--color-charcoal)",
} as const;

export const radius = {
  sm: "var(--radius-thumbnail)", md: "var(--radius-field)",
  lg: "var(--radius-card)", xl: "var(--radius-panel)", full: "var(--radius-pill)",
} as const;
export const figma = (file: string) => `/figma/${file}`;
