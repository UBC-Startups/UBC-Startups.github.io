"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main id="main-content" className="status-page"><h1>Something went wrong</h1><p>Please try loading this page again.</p><button type="button" onClick={reset}>Try again</button><Link href="/">Return home</Link></main>;
}
