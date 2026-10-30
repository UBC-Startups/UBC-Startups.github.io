"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./photoGallery.module.css";

export default function PhotoGallery({ images }: { images: { original: string }[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % images.length), 5000);
    return () => window.clearInterval(timer);
  }, [paused, images.length]);
  return <section className={styles.gallery} aria-label="SOAR event photos" aria-roledescription="carousel">
    <div className={styles.slide}>
      <Image src={images[index].original} alt={`SOAR event photo ${index + 1} of ${images.length}`} width={1000} height={640} sizes="(max-width: 900px) 80vw, 40vw" />
      <button type="button" className={styles.previous} aria-label="Previous SOAR photo" onClick={() => { setPaused(true); setIndex((index - 1 + images.length) % images.length); }}>‹</button>
      <button type="button" className={styles.next} aria-label="Next SOAR photo" onClick={() => { setPaused(true); setIndex((index + 1) % images.length); }}>›</button>
    </div>
    <div className={styles.controls}>
      {images.map((image, i) => <button key={image.original} type="button" aria-label={`Show SOAR photo ${i + 1}`} aria-pressed={i === index} onClick={() => { setPaused(true); setIndex(i); }}>●</button>)}
      <button type="button" onClick={() => setPaused(!paused)}>{paused ? "Play slideshow" : "Pause slideshow"}</button>
    </div>
  </section>;
}
