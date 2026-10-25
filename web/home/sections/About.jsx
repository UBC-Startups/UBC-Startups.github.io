"use client";

import styles from "./About.module.css";
import { useEffect, useState } from "react";
import { color } from "../theme";
import { about } from "../content";
import { SectionLabel } from "../ui";
const Chevron = ({
  dir
}) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{
  transform: dir === "left" ? "rotate(180deg)" : "none"
}}>
    <path d="M6 3l5 5-5 5" />
  </svg>;
function PhotoCarousel() {
  const [i, setI] = useState(0);
  const n = about.photos.length;
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI(x => (x + 1) % n), 5000);
    return () => clearInterval(id);
  }, [n, i]);
  return <div className={styles.Carousel}>
      {about.photos.map((p, k) => <img key={p.alt} src={p.src} alt={k === i ? p.alt : ""} className={styles.Slide} style={{
      "--slide-0": k === i ? 1 : 0
    }} />)}
      <button type="button" aria-label="Previous photo" onClick={() => setI(x => (x - 1 + n) % n)} className={styles.NavBtn} style={{
      "--navbtn-0": "12px",
      "--navbtn-1": "auto"
    }}>
        <Chevron dir="left" />
      </button>
      <button type="button" aria-label="Next photo" onClick={() => setI(x => (x + 1) % n)} className={styles.NavBtn} style={{
      "--navbtn-0": "auto",
      "--navbtn-1": "12px"
    }}>
        <Chevron dir="right" />
      </button>
      <div role="tablist" aria-label="Event photos" className={styles.Dots}>
        {about.photos.map((p, k) => <button key={p.alt} type="button" role="tab" aria-selected={k === i} aria-label={`Show photo ${k + 1}: ${p.alt}`} onClick={() => setI(k)} className={styles.DotBtn} style={{
        "--dotbtn-0": k === i ? "24px" : "8px",
        "--dotbtn-1": k === i ? color.accent : "rgba(255,255,255,0.85)"
      }} />)}
      </div>
    </div>;
}
export default function About() {
  return <section id="aboutUs" aria-labelledby="about-title" className={styles.Section}>
      <div className={styles.Row}>
        <div className={styles.Copy}>
          <SectionLabel label={about.label} showIcon={false} />
          <h2 id="about-title">{about.title}</h2>
          <p className="body">{about.body}</p>
        </div>
        <PhotoCarousel />
      </div>
    </section>;
}
