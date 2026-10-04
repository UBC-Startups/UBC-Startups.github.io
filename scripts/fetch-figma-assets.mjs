// Downloads every image/SVG used on the homepage from the Figma MCP export
// into public/figma/, so the site never points at temporary Figma URLs.
//
//   npm run assets
//
// The Figma asset URLs below are short-lived (they expire ~7 days after
// export, around Oct 10, 2026). If they 403/404, re-export the HOMEPAGE frame
// (node 45:623) and the Events page (47:454) and paste the new prefixes above.

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ASSET_PREFIX =
  "https://www.figma.com/api/mcp/asset/dd7a8dfc-b750-4742-80d8-e5347ce9b134";
// Glows used only by the Events and Team page heroes (separate Figma export).
const PAGE_ASSET_PREFIX =
  "https://www.figma.com/api/mcp/asset/9380597c-ca19-4855-bcfc-432c89a9e58c";

// local file name  ->  Figma asset id
const ASSETS = {
  "button-dot.svg": "ebbe6.svg",
  "hero-glow-bottom-left.svg": "afe1f.svg",
  "hero-glow-top-right.svg": "17281.svg",
  "hero-logo.svg": "9c9fe.svg",
  "timeline-tick.svg": "81137.svg",
  "timeline-arrow.svg": "43707.svg",
  "timeline-dot.svg": "812ed.svg",
  "carousel-dots.svg": "42ce0.svg",
  "program-dots-networking.svg": "d6454.svg",
  "program-dots-workshops.svg": "f9576.svg",
  "program-dots-resources.svg": "391b4.svg",
  "value-icon-exclusivity.svg": "73eeb.svg",
  "value-icon-community.svg": "0fe43.svg",
  "value-icon-growth.svg": "3c3c5.svg",
  "value-icon-boldness.svg": "f748b.svg",
  "value-dot-boldness.svg": "3db1d.svg",
  "value-dot-growth.svg": "cd7f5.svg",
  "value-dot-community.svg": "aa723.svg",
  "value-dot-exclusivity.svg": "44cf0.svg",
  "chevron-open.svg": "00d27.svg",
  "chevron-closed.svg": "b26a1.svg",
  "footer-glow-left.svg": "4c12b.svg",
  "footer-glow-right.svg": "c43cd.svg",
  "logo-mark-inverse.svg": "14bd9.svg",
  "logo-mark.svg": "c6adc.svg",
  "icon-linkedin.svg": "ad6ca.svg",
  "icon-instagram.svg": "b4603.svg",
  "icon-email.svg": "a0112.svg",
  "page-hero-glow-bottom-left.svg": `${PAGE_ASSET_PREFIX}/91164.svg`,
  "page-hero-glow-top-right.svg": `${PAGE_ASSET_PREFIX}/6eb43.svg`,
};

const outDir = join(process.cwd(), "public", "figma");
await mkdir(outDir, { recursive: true });

let failed = 0;
for (const [file, id] of Object.entries(ASSETS)) {
  const url = id.startsWith("https://") ? id : `${ASSET_PREFIX}/${id}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`✗ ${file}  (${res.status})`);
    failed++;
    continue;
  }
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length === 0) {
    console.error(`✗ ${file}  (empty file)`);
    failed++;
    continue;
  }
  await writeFile(join(outDir, file), bytes);
  console.log(`✓ ${file}  ${bytes.length} bytes`);
}

if (failed) {
  console.error(`\n${failed} asset(s) failed. The export links have probably expired; re-export from Figma.`);
  process.exit(1);
}
console.log(`\nAll ${Object.keys(ASSETS).length} assets saved to public/figma/`);
