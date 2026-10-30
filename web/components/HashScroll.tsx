"use client";

import { useEffect } from "react";

// A streamed page's anchor can mount after the router's initial scroll attempt.
// Mount this with the destination content, rather than scrolling from the link.
export default function HashScroll() {
  useEffect(() => {
    let cancelled = false;
    let frame: number | undefined;

    const scrollToHash = async () => {
      const hash = window.location.hash;
      if (!hash) return;

      // Font metrics can move sections after the initial client render.
      await document.fonts.ready;
      if (cancelled || window.location.hash !== hash) return;

      frame = requestAnimationFrame(() => {
        if (cancelled || window.location.hash !== hash) return;
        let id: string;
        try {
          id = decodeURIComponent(hash.slice(1));
        } catch {
          return;
        }
        document.getElementById(id)?.scrollIntoView({ block: "start" });
      });
    };

    void scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      cancelled = true;
      if (frame !== undefined) cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, []);

  return null;
}
