"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button, Heading, Text, TextField } from "../../components/ui";
import { links } from "../content";
import { Glow } from "../ui";
import styles from "./NewsletterFooter.module.css";

const footerLinks = [
  { label: "Instagram", href: links.instagram }, { label: "LinkedIn", href: links.linkedin },
  { label: "Discord", href: links.discord }, { label: "Email", href: links.email },
];
const ML_ACTION = "https://assets.mailerlite.com/jsonp/2125347/forms/180438509070321370/subscribe";
const ML_IFRAME_NAME = "ml-newsletter-target";

export default function NewsletterFooter({ title = "Stay in the loop.", year }: { title?: string; year: number }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return <footer id="subscription" className="relative isolate mt-20 flex flex-col gap-24 overflow-hidden rounded-panel bg-inverse px-lg py-xxl sm:px-12 sm:pt-12 sm:pb-14 lg:min-h-[443px] lg:pt-[140px]">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <Glow $inset="-31.75%" style={{ left: -65, top: 105, width: 630, height: 630 }}><div><Image src="/figma/footer-glow-left.svg" alt="" fill sizes="1030px" /></div></Glow>
      <Glow $inset="-28.57%" style={{ right: -294, top: -290, width: 700, height: 700 }}><div><Image src="/figma/footer-glow-right.svg" alt="" fill sizes="1100px" /></div></Glow>
      <div className={styles.orangeGlow} />
    </div>
    <div className="relative z-1 flex flex-col gap-xl lg:flex-row lg:items-center lg:justify-between">
      <Heading variant="newsletter-title" className="text-ink-inverse">{title}</Heading>
      <div className="flex w-full flex-col gap-lg lg:max-w-[420px]">
        <Text className="max-w-[387px] text-ink-inverse">Get the latest updates on events, workshops, and opportunities delivered straight to your inbox.</Text>
        {submitted && <Text role="status" className="text-ink-inverse">Thanks — you&apos;re on the list!</Text>}
        {/* Keep the form connected until the browser finishes its native POST. */}
        <form action={ML_ACTION} method="post" target={ML_IFRAME_NAME} onSubmit={() => { if (email) setSubmitted(true); }} hidden={submitted} className={submitted ? "hidden" : "flex items-center gap-sm"}>
          <TextField id="newsletter-email" label="Email address" hideLabel aria-label="Email address" tone="dark" containerClassName="flex-1" type="email" name="fields[email]" required placeholder="you@email.com" value={email} onChange={event => setEmail(event.target.value)} />
          <input type="hidden" name="ml-submit" value="1" />
          <input type="hidden" name="anticsrf" value="true" />
          <Button type="submit" variant="secondary">Subscribe</Button>
        </form>
      </div>
    </div>
    <iframe name={ML_IFRAME_NAME} title="Newsletter signup" className="hidden" />
    <div className="relative z-1 flex flex-col gap-lg md:flex-row md:items-center md:justify-between">
      <Link href="/" className="flex items-center gap-2.5 text-label-l text-ink-inverse no-underline"><Image src="/figma/logo-mark-inverse.svg" alt="" width={28} height={28} className="block" />UBC Startups</Link>
      <ul className="m-0 flex list-none flex-wrap gap-x-xxl gap-y-sm p-0">
        {footerLinks.map(link => <li key={link.label}><a href={link.href} target="_blank" rel="noreferrer" className="inline-block text-label-m text-ink-inverse no-underline transition-[color,transform] duration-200 hover:scale-[1.12] hover:text-accent">{link.label}</a></li>)}
      </ul>
      <Text variant="label-s" className="text-ink-inverse-muted">© {year} UBC Startups. All rights reserved.</Text>
    </div>
  </footer>;
}
