"use client";

import styles from "./SocialFeed.module.css";
import { useEffect, useRef } from "react";
import { links, socialFeed } from "../content";
import { SectionLabel } from "../ui";

/** Shared height for both native embeds so the two cards line up. */
const EMBED_HEIGHT = 460;
/** LinkedIn's iframe embed needs an `urn:li:...` id; derive it from a post URL. */
function linkedInEmbedSrc(url) {
  if (!url) return null;
  const urn = url.match(/urn:li:[a-zA-Z]+:\d+/);
  if (urn) return `https://www.linkedin.com/embed/feed/update/${urn[0]}`;
  const activity = url.match(/activity[-:](\d+)/);
  if (activity) return `https://www.linkedin.com/embed/feed/update/urn:li:activity:${activity[1]}`;
  return null;
}
function LinkedInEmbed({
  src
}) {
  return <iframe src={src} title="LinkedIn post" frameBorder="0" scrolling="auto" allowFullScreen style={{
    display: "block",
    width: "100%",
    height: EMBED_HEIGHT,
    border: 0
  }} />;
}
let igScript;
function processInstagram() {
  if (window.instgrm?.Embeds?.process) window.instgrm.Embeds.process();
}
function InstagramEmbed({
  url
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (!url) return;
    const root = ref.current;
    /* Instagram renders its embed with scrolling="no"; re-enable it so the card can
       be shorter than the embed's natural height without permanently hiding content. */
    const applyScroll = () => {
      root?.querySelectorAll("iframe.instagram-media").forEach(frame => frame.setAttribute("scrolling", "auto"));
    };
    const observer = new MutationObserver(applyScroll);
    if (root) observer.observe(root, {
      childList: true,
      subtree: true
    });
    const onLoad = () => {
      processInstagram();
      applyScroll();
    };
    if (window.instgrm) {
      onLoad();
    } else if (!igScript) {
      igScript = document.createElement("script");
      igScript.async = true;
      igScript.src = "https://www.instagram.com/embed.js";
      igScript.addEventListener("load", onLoad);
      document.body.appendChild(igScript);
    } else {
      igScript.addEventListener("load", onLoad);
    }
    return () => observer.disconnect();
  }, [url]);
  if (!url) return null;
  return <div ref={ref} className={styles.EmbedSlot}>
      <blockquote className="instagram-media" data-instgrm-permalink={`${url}?utm_source=ig_embed&utm_campaign=loading`} data-instgrm-version="14" style={{
      background: "#FFF",
      border: 0,
      borderRadius: "3px",
      boxShadow: "0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)",
      margin: "1px",
      maxWidth: "100%",
      minWidth: "326px",
      padding: 0,
      width: "100%"
    }}>
        <a href={url} target="_blank" rel="noreferrer">View this post on Instagram</a>
      </blockquote>
    </div>;
}
const Arrow = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
  </svg>;
function EmbedCard({
  platform,
  icon,
  children
}) {
  return <article className={styles.Card}>
      <div className={styles.CardHead}>
        {icon}
        <p className={styles.CardName}>{platform}</p>
      </div>
      <div className={styles.CardBody}>{children}</div>
    </article>;
}

/** Shown when a post URL is missing or can't be parsed into an embed. */
function Fallback({
  platform,
  href
}) {
  return <div className={styles.FallbackBox}>
      <p className={styles.FallbackTitle}>Post unavailable</p>
      <p className={styles.FallbackText}>We couldn&apos;t load this {platform} post right now.</p>
      <a href={href} target="_blank" rel="noreferrer" className={styles.FallbackLink}>
        View our {platform} <Arrow />
      </a>
    </div>;
}
export default function SocialFeed() {
  const {
    label,
    title,
    body,
    linkedin,
    instagram
  } = socialFeed;
  const linkedinSrc = linkedInEmbedSrc(linkedin);
  return <section aria-labelledby="social-feed-title" className={styles.Section}>
      <div className={styles.Head}>
        <SectionLabel label={label} />
        <div className={styles.TitleRow}>
          <h2 id="social-feed-title">{title}</h2>
          <div className={styles.PlatformLinks}>
            <a href={links.linkedin} target="_blank" rel="noreferrer" className={styles.PlatformLink}>
              LinkedIn <Arrow />
            </a>
            <a href={links.instagram} target="_blank" rel="noreferrer" className={styles.PlatformLink}>
              Instagram <Arrow />
            </a>
          </div>
        </div>
        <p className="body">{body}</p>
      </div>

      <div className={styles.Grid}>
        <EmbedCard platform="LinkedIn" icon={<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <rect width="24" height="24" rx="4" fill="#0A66C2" />
              <path fill="#fff" d="M7.2 9.4h2.1v7.4H7.2zM8.25 5.6a1.22 1.22 0 1 1 0 2.44 1.22 1.22 0 0 1 0-2.44zM11 9.4h2v1.01h.03c.28-.53.96-1.09 1.98-1.09 2.12 0 2.51 1.4 2.51 3.21v4.27h-2.1v-3.78c0-.9-.02-2.06-1.26-2.06-1.26 0-1.45.98-1.45 1.99v3.85H11z" />
            </svg>}>
          {linkedinSrc ? <LinkedInEmbed src={linkedinSrc} /> : <Fallback platform="LinkedIn" href={links.linkedin} />}
        </EmbedCard>
        <EmbedCard platform="Instagram" icon={<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <defs>
                <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                  <stop offset="0%" stopColor="#fdf497" />
                  <stop offset="45%" stopColor="#fd5949" />
                  <stop offset="60%" stopColor="#d6249f" />
                  <stop offset="90%" stopColor="#285AEB" />
                </radialGradient>
              </defs>
              <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
              <rect x="5.6" y="5.6" width="12.8" height="12.8" rx="4" fill="none" stroke="#fff" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" strokeWidth="1.5" />
              <circle cx="16.1" cy="7.9" r="0.9" fill="#fff" />
            </svg>}>
          {instagram ? <InstagramEmbed url={instagram} /> : <Fallback platform="Instagram" href={links.instagram} />}
        </EmbedCard>
      </div>
    </section>;
}
