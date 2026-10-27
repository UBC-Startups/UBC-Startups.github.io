"use client";

import styles from "./Stats.module.css";
import { useEffect, useRef, useState } from "react";
import { stats } from "../content";
const DURATION = 1600; // ms

// The final value sits invisibly underneath to reserve its width, so the layout
// doesn't shift while the number counts up.

/** "$12,000+" -> { prefix: "$", target: 12000, suffix: "+" } */
function parse(value) {
  const m = value.match(/^([^\d]*)([\d,]+)(.*)$/);
  if (!m) return {
    prefix: "",
    target: 0,
    suffix: value
  };
  return {
    prefix: m[1],
    target: Number(m[2].replace(/,/g, "")),
    suffix: m[3]
  };
}
const easeOut = t => 1 - Math.pow(1 - t, 3);
function CountUp({
  value,
  start
}) {
  const {
    prefix,
    target,
    suffix
  } = parse(value);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setN(target));
      return () => cancelAnimationFrame(frame);
    }
    let raf;
    const t0 = performance.now();
    const tick = now => {
      const t = Math.min((now - t0) / DURATION, 1);
      setN(Math.round(easeOut(t) * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target]);
  return <p aria-label={value} className={styles.Value}>
      <span className="reserve" aria-hidden>{value}</span>
      <span aria-hidden>{prefix}{n.toLocaleString("en-US")}{suffix}</span>
    </p>;
}
export default function Stats() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  // Start counting the first time the stats scroll into view.
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        io.disconnect();
      }
    }, {
      threshold: 0.4
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <section aria-label="UBC Startups in numbers" ref={ref} className={styles.Section}>
      <ul className={styles.List}>
        {stats.map(s => <li key={s.label} className={styles.Stat}>
            <CountUp value={s.value} start={visible} />
            <p className="label">{s.label}</p>
          </li>)}
      </ul>
    </section>;
}
