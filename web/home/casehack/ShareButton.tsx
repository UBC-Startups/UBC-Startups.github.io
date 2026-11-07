"use client";

import { useState } from "react";

/** Shares the page with the native share sheet, or copies the link where that isn't available. */
export default function ShareButton() {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: "CaseHack | UBC Startups", url }); return; }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* User cancelled the share sheet. */ }
  }
  return <button type="button" onClick={share} className="m-0 cursor-pointer border-0 bg-transparent p-0 font-mono text-[12px] font-medium tracking-[0.06em] text-casehack-mint hover:text-casehack-mint-bright">
    <span aria-live="polite">{copied ? "✓ LINK COPIED" : "↗ SHARE"}</span>
  </button>;
}