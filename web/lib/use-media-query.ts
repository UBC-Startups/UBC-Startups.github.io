"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: string) {
  return (onChange: () => void) => {
    const list = window.matchMedia(query);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  };
}

// Assume the widest layout on the server and during hydration; the real
// match is a client-only enhancement once the query can be evaluated.
function getServerSnapshot() {
  return false;
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(subscribe(query), () => window.matchMedia(query).matches, getServerSnapshot);
}
