"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { links, navLinks } from "../content";

const socials = [
  { label: "LinkedIn", href: links.linkedin, icon: "icon-linkedin.svg", size: 28 },
  { label: "Instagram", href: links.instagram, icon: "icon-instagram.svg", size: 28 },
  { label: "Email", href: links.email, icon: "icon-email.svg", size: 40 },
];

type NavigationItem = { label: string; to?: string; hash?: string };

function NavItem({ item, active, onClick, mobile = false }: { item: NavigationItem; active?: string; onClick?: () => void; mobile?: boolean }) {
  return <Link
    href={item.hash ?? item.to ?? "/"}
    prefetch={item.hash ? false : undefined}
    aria-current={active === item.label ? "page" : undefined}
    onClick={() => { if (!item.hash) window.scrollTo(0, 0); onClick?.(); }}
    className={`text-navigation text-ink no-underline aria-[current=page]:font-semibold ${mobile ? "py-xs leading-[normal]" : "hover:text-accent"}`}
  >{item.label}</Link>;
}

function SocialIcons() {
  return socials.map(social => <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} className="flex size-10 items-center justify-center rounded-full hover:bg-muted">
    <Image src={`/figma/${social.icon}`} alt="" width={social.size} height={social.size} className="block" />
  </a>);
}

export default function Nav({ active }: { active?: string }) {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 bg-canvas">
    <nav aria-label="Main" className="flex items-center justify-between py-md pl-lg pr-xs">
      <Link href="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-xs text-brand text-ink no-underline">
        <Image src="/figma/logo-mark.svg" alt="" width={34} height={34} className="block" />
        UBC Startups
      </Link>
      <ul className="m-0 hidden list-none gap-[clamp(32px,5vw,72px)] p-0 lg:flex">
        {navLinks.map(item => <li key={item.label}><NavItem item={item} active={active} /></li>)}
      </ul>
      <div className="hidden items-center gap-md lg:flex"><SocialIcons /></div>
      <button type="button" aria-expanded={open} aria-controls="home-mobile-menu" onClick={() => setOpen(!open)} className="m-0 cursor-pointer rounded-pill border-0 bg-transparent px-md py-xs font-brand text-label-m text-ink hover:bg-muted lg:hidden">{open ? "Close" : "Menu"}</button>
    </nav>
    {open && <div id="home-mobile-menu" className="flex flex-col gap-xxs px-lg pb-lg lg:hidden">
      {navLinks.map(item => <NavItem key={item.label} item={item} active={active} mobile onClick={() => setOpen(false)} />)}
      <div className="mt-xs flex gap-md"><SocialIcons /></div>
    </div>}
  </header>;
}
