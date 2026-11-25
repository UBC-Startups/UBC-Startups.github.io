"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { links, navLinks } from "../content";

const socials = [
  { label: "LinkedIn", href: links.linkedin, icon: "icon-linkedin.svg", size: 28 },
  { label: "Instagram", href: links.instagram, icon: "icon-instagram.svg", size: 28 },
  { label: "Email", href: links.email, icon: "icon-email.svg", size: 40 },
];

type NavigationItem = { label: string; to?: string; hash?: string };
type Tone = "light" | "dark";

function NavItem({ item, active, onClick, mobile = false, tone = "light" }: { item: NavigationItem; active?: string; onClick?: () => void; mobile?: boolean; tone?: Tone }) {
  return <Link
    href={item.hash ?? item.to ?? "/"}
    prefetch={item.hash ? false : undefined}
    aria-current={active === item.label ? "page" : undefined}
    onClick={() => { if (!item.hash) window.scrollTo(0, 0); onClick?.(); }}
    className={`text-navigation no-underline aria-[current=page]:font-semibold ${tone === "dark" ? "text-ink-inverse" : "text-ink"} ${mobile ? "py-xs leading-[normal]" : "hover:text-accent"}`}
  >{item.label}</Link>;
}

function SocialIcons({ tone = "light" }: { tone?: Tone }) {
  return socials.map(social => <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} className={`flex size-10 items-center justify-center rounded-full ${tone === "dark" ? "hover:bg-white/10" : "hover:bg-muted"}`}>
    <Image src={`/figma/${social.icon}`} alt="" width={social.size} height={social.size} className="block" />
  </a>);
}

function MenuIcon() {
  return <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden="true">
    <path d="M0 1H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M0 8H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M0 15H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>;
}

function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M1 1L15 15M15 1L1 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>;
}

export default function Nav({ active }: { active?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return <header className="full-bleed sticky top-0 z-50 bg-canvas">
    <div className="mx-auto max-w-site px-page-gutter sm:px-page-gutter-sm lg:px-page-gutter-lg">
      <nav aria-label="Main" className="flex items-center justify-between py-md pl-lg pr-xs">
        <Link href="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-xs text-brand text-ink no-underline">
          <Image src="/figma/logo-mark.svg" alt="" width={34} height={34} className="block" />
          UBC Startups
        </Link>
        <ul className="m-0 hidden list-none gap-[clamp(32px,5vw,72px)] p-0 lg:flex">
          {navLinks.map(item => <li key={item.label}><NavItem item={item} active={active} /></li>)}
        </ul>
        <div className="hidden items-center gap-md lg:flex"><SocialIcons /></div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="home-mobile-menu"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="m-0 flex size-10 cursor-pointer items-center justify-center rounded-pill border-0 bg-transparent text-ink hover:bg-muted lg:hidden"
        ><MenuIcon /></button>
      </nav>
    </div>

    <div
      aria-hidden={!open}
      onClick={() => setOpen(false)}
      className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
    />

    <div
      id="home-mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Main menu"
      aria-hidden={!open}
      className={`fixed inset-y-0 right-0 z-[70] flex w-4/5 max-w-[320px] flex-col gap-xl bg-inverse px-lg py-lg shadow-2xl transition-transform duration-300 ease-out lg:hidden ${open ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="flex items-center justify-between">
        <Link href="/" onClick={() => { window.scrollTo(0, 0); setOpen(false); }} className="flex items-center gap-xs text-brand text-ink-inverse no-underline">
          <Image src="/figma/logo-mark-inverse.svg" alt="" width={28} height={28} className="block" />
          UBC Startups
        </Link>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="m-0 flex size-10 cursor-pointer items-center justify-center rounded-pill border-0 bg-transparent text-ink-inverse hover:bg-white/10"><CloseIcon /></button>
      </div>
      <ul className="m-0 flex list-none flex-col gap-xs p-0">
        {navLinks.map(item => <li key={item.label}><NavItem item={item} active={active} mobile tone="dark" onClick={() => setOpen(false)} /></li>)}
      </ul>
      <div className="mt-auto flex gap-md"><SocialIcons tone="dark" /></div>
    </div>
  </header>;
}
