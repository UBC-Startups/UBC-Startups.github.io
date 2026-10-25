// Shared brand values for interactive components; layout styles live in CSS Modules.
export const color = {
  canvas: "#efefec",
  surface: "#ffffff",
  inverse: "#0a0a0a",
  inverseSubtle: "#2a2a2a",
  muted: "#dad9d4",
  ink: "#0a0a0a",
  inkSecondary: "#6b6b6b",
  inkTertiary: "#b5b5b0",
  inkInverse: "#ffffff",
  inkInverseMuted: "#8a8a8a",
  accent: "#ff5a1f",
  red: "#dd3322",
  green: "#88dcbe",
  charcoal: "#1a1a1a",
} as const;

export const radius = { sm: "12px", md: "16px", lg: "20px", xl: "24px", full: "999px" } as const;
export const figma = (file: string) => `/figma/${file}`;
