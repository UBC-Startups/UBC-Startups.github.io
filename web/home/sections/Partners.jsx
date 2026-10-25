"use client";

import styles from "./Partners.module.css";
import { useState } from "react";
import { partners } from "../content";
const SECONDS_PER_LOGO = 3;

// One copy of the list scrolls left by exactly its own width, so the duplicate
// takes its place and the loop is seamless (same technique as Team.jsx).

function Logos({
  hidden
}) {
  return partners.map(p => {
    const img = <img src={p.logo} alt={hidden ? "" : p.name} style={{
      height: p.height
    }} loading="eager" draggable={false} />;
    return <li key={(hidden ? "b-" : "a-") + p.name} aria-hidden={hidden || undefined} className={styles.Tile}>
        {p.url ? <a href={p.url} target="_blank" rel="noreferrer" tabIndex={hidden ? -1 : undefined}>
            {img}
          </a> : <div>{img}</div>}
      </li>;
  });
}
export default function Partners() {
  const [paused, setPaused] = useState(false);
  return <section aria-labelledby="partners-title" className={styles.Section}>
      <h2 id="partners-title">Our Partners</h2>
      <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} className={styles.Viewport}>
        <ul aria-label="Our partners and sponsors" className={styles.Track} style={{
        "--track-0": partners.length * SECONDS_PER_LOGO,
        "--track-1": paused ? "paused" : "running"
      }}>
          <Logos />
          <Logos hidden />
        </ul>
      </div>
    </section>;
}
