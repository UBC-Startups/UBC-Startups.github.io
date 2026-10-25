"use client";

import styles from "./Nav.module.css";
import { useState } from "react";
import Link from "next/link";
import { figma } from "../theme";
import { links, navLinks } from "../content";
const socials = [{
  label: "LinkedIn",
  href: links.linkedin,
  icon: figma("icon-linkedin.svg"),
  size: 20
}, {
  label: "Instagram",
  href: links.instagram,
  icon: figma("icon-instagram.svg"),
  size: 20
}, {
  label: "Email",
  href: links.email,
  icon: figma("icon-email.svg"),
  size: 28
}];
function NavItem({
  item,
  active,
  onClick
}) {
  const current = active === item.label ? "page" : undefined;
  return item.hash ? <Link href={item.hash} onClick={onClick} aria-current={current}>{item.label}</Link> : <Link href={item.to} aria-current={current} onClick={() => {
    window.scrollTo(0, 0);
    onClick?.();
  }}>
      {item.label}
    </Link>;
}
function SocialIcons() {
  return socials.map(s => <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className={styles.SocialLink}>
      <img src={s.icon} alt="" width={s.size} height={s.size} />
    </a>);
}

/** `active` is the label of the current page ("Events", "Team"), shown in semibold. */
export default function Nav({
  active
}) {
  const [open, setOpen] = useState(false);
  return <header className={styles.Header}>
      <nav aria-label="Main" className={styles.Bar}>
        <Link href="/" onClick={() => window.scrollTo(0, 0)} className={styles.Brand}>
          <img src={figma("logo-mark.svg")} alt="" />
          UBC Startups
        </Link>
        <ul className={styles.Links}>
          {navLinks.map(item => <li key={item.label}><NavItem item={item} active={active} /></li>)}
        </ul>
        <div className={styles.Socials}><SocialIcons /></div>
        <button aria-expanded={open} aria-controls="home-mobile-menu" onClick={() => setOpen(o => !o)} className={styles.MenuButton}>
          {open ? "Close" : "Menu"}
        </button>
      </nav>
      {open && <div id="home-mobile-menu" className={styles.MobileMenu}>
          {navLinks.map(item => <NavItem key={item.label} item={item} active={active} onClick={() => setOpen(false)} />)}
          <div style={{
        display: "flex",
        gap: 16,
        marginTop: 8
      }}><SocialIcons /></div>
        </div>}
    </header>;
}
