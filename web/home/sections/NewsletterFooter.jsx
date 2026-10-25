"use client";

import styles from "./NewsletterFooter.module.css";
import { useState } from "react";
import Link from "next/link";
import { figma } from "../theme";
import { links } from "../content";
import { Button, Glow } from "../ui";

// Same inset, rounded-corner treatment as PageHero (the dark hero on the
// Events/Team pages), so the two black sections bookending a page match.

const footerLinks = [{
  label: "Instagram",
  href: links.instagram
}, {
  label: "LinkedIn",
  href: links.linkedin
}, {
  label: "Discord",
  href: links.discord
}, {
  label: "Email",
  href: links.email
}];

// Posts straight to the same MailerLite endpoint their own embed widget
// uses (account 2125347, form OLHxhO) via a hidden iframe target, so it
// works as a normal signup without a cross-origin fetch/CORS, and without
// depending on MailerLite's embed script re-scanning the DOM after this
// component remounts (which it doesn't reliably do when the user navigates
// between pages in this single-page app).
const ML_ACTION = "https://assets.mailerlite.com/jsonp/2125347/forms/180438509070321370/subscribe";
const ML_IFRAME_NAME = "ml-newsletter-target";
export default function NewsletterFooter({
  title = "Stay in the loop.",
  year
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitted

  const handleSubmit = () => {
    if (!email) return;
    setStatus("submitted");
  };
  return <footer id="subscription" className={styles.Footer}>
      <div aria-hidden className={styles.Glows}>
        <Glow $inset="-31.75%" style={{
        left: -65,
        top: 105,
        width: 630,
        height: 630
      }}>
          <div><img src={figma("footer-glow-left.svg")} alt="" /></div>
        </Glow>
        <Glow $inset="-28.57%" style={{
        right: -294,
        top: -290,
        width: 700,
        height: 700
      }}>
          <div><img src={figma("footer-glow-right.svg")} alt="" /></div>
        </Glow>
        <div className={styles.OrangeGlow} />
      </div>

      <div className={styles.Main}>
        <h2>{title}</h2>
        <div className={styles.Join}>
          <p>Get the latest updates on events, workshops, and opportunities delivered straight to your inbox.</p>
          {status === "submitted" ? <p className={styles.StatusText}>Thanks — you&apos;re on the list!</p> : <form action={ML_ACTION} method="post" target={ML_IFRAME_NAME} onSubmit={handleSubmit} className={styles.Form}>
              <input type="email" name="fields[email]" required aria-label="Email address" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} className={styles.EmailInput} />
              <input type="hidden" name="ml-submit" value="1" />
              <input type="hidden" name="anticsrf" value="true" />
              <Button type="submit" variant="secondary">Subscribe</Button>
            </form>}
        </div>
      </div>
      <iframe name={ML_IFRAME_NAME} title="Newsletter signup" style={{
      display: "none"
    }} />

      <div className={styles.Bottom}>
        <Link href="/" className={styles.Brand}>
          <img src={figma("logo-mark-inverse.svg")} alt="" />
          UBC Startups
        </Link>
        <ul className={styles.Social}>
          {footerLinks.map(l => <li key={l.label}>
              <a href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
            </li>)}
        </ul>
        <p className={styles.Copyright}>© {year} UBC Startups. All rights reserved.</p>
      </div>
    </footer>;
}
