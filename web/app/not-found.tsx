import Link from "next/link";

export default function NotFound() {
  return <main id="main-content" className="status-page"><h1>Page not found</h1><p>The page you’re looking for isn’t available.</p><Link href="/events">Browse events</Link><Link href="/">Return home</Link></main>;
}
