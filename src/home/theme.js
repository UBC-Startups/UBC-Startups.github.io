// Design tokens from the Figma file "UBC Startups — Website Remix" (HOMEPAGE, node 45:623).
import { css } from "styled-components";

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
  // Brand gradient stops (fixed values in Figma, not tokens)
  red: "#dd3322",
  green: "#88dcbe",
  charcoal: "#1a1a1a",
};

export const space = { xxs: "4px", xs: "8px", sm: "12px", md: "16px", lg: "24px", xl: "32px", xxl: "40px", xxxl: "64px", section: "180px" };

export const radius = { sm: "12px", md: "16px", lg: "20px", xl: "24px", full: "999px" };

export const bp = {
  sm: "@media (min-width: 640px)",
  md: "@media (min-width: 768px)",
  lg: "@media (min-width: 1024px)",
  xl: "@media (min-width: 1280px)",
};

export const font = `"Poppins", system-ui, sans-serif`;

// Figma text styles. Large sizes clamp down on small screens.
const t = (size, weight, lineHeight, tracking = "0") => css`
  font-family: ${font};
  font-size: ${size};
  font-weight: ${weight};
  line-height: ${lineHeight};
  letter-spacing: ${tracking};
  margin: 0;
`;

export const type = {
  displayXL: t("clamp(72px, 15.5vw, 220px)", 700, 0.82, "-0.05em"),
  displayM: t("clamp(72px, 8.5vw, 120px)", 700, 1, "-0.05em"),
  displayS: t("clamp(48px, 5.6vw, 80px)", 700, 1, "-0.05em"),
  headingXL: t("clamp(40px, 4.5vw, 64px)", 600, 1, "-0.04em"),
  headingM: t("clamp(20px, 2vw, 28px)", 500, 1.2, "-0.02em"),
  headingS: t("22px", 600, 1.05, "-0.02em"),
  bodyXL: t("clamp(19px, 1.85vw, 26px)", 500, 1.18, "-0.01em"),
  labelL: t("17px", 600, 1.2, "-0.02em"),
  bodyL: t("17px", 400, 1.45),
  bodyM: t("15px", 400, 1.45),
  labelM: t("14px", 500, 1.2),
  labelS: t("12px", 500, 1.2),
  bodyS: t("12px", 400, 1.3),
  caption: t("11px", 500, 1.2),
};

export const figma = (file) => `${process.env.PUBLIC_URL}/figma/${file}`;

export const sectionPad = css`
  padding-left: 16px;
  padding-right: 16px;
  ${bp.sm} {
    padding-left: ${space.xl};
    padding-right: ${space.xl};
  }
`;
