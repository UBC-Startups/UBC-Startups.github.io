"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { links } from "../home/content";
import styles from "./navigationBar.module.css";

const navigation = [
  ["Home", "/"], ["About Us", "/#aboutUs"], ["Events", "/events"],
  ["Team", "/meetOurTeam"], ["FAQ", "/#faq"],
];
const socials = [
  ["LinkedIn", links.linkedin, "linkedin-c.png"],
  ["Instagram", links.instagram, "instagram-c.png"],
  ["Discord", links.discord, "discord-c.png"],
];

export default function NavigationBar() {
  const [open, setOpen] = useState(false);
  return <header className={styles.header}>
    <nav className={styles.bar} aria-label="Main">
      <Link href="/" aria-label="UBC Startups home"><Image src="/images/Logo.svg" alt="" width={70} height={70} /></Link>
      <ul className={styles.links}>{navigation.map(([label, href]) => <li key={label}><Link href={href}>{label}</Link></li>)}</ul>
      <div className={styles.socials}>{socials.map(([label, href, image]) => <a key={label} href={href} aria-label={label} target="_blank" rel="noreferrer"><Image src={`/images/${image}`} alt="" width={40} height={40} /></a>)}</div>
      <button type="button" className={styles.toggle} aria-expanded={open} aria-controls="poster-mobile-menu" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>
    </nav>
    {open && <nav id="poster-mobile-menu" className={styles.mobile} aria-label="Mobile">{navigation.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}</Link>)}</nav>}
  </header>;
}
