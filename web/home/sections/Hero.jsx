"use client";

import styles from "./Hero.module.css";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "../../lib/use-prefers-reduced-motion";
import Link from "next/link";
import { figma } from "../theme";
import { timeline } from "../content";
import { Glow } from "../ui";
import { Button } from "../../components/ui";
const LINE_Y = 95; // distance from top of the timeline box to the arrow

const entrance = (reduceMotion, delay = 0, distance = 20) => ({
  initial: reduceMotion ? false : {
    opacity: 0,
    y: distance
  },
  animate: {
    opacity: 1,
    y: 0
  },
  transition: {
    duration: reduceMotion ? 0 : 0.7,
    delay: reduceMotion ? 0 : delay,
    ease: [0.22, 1, 0.36, 1]
  }
});

/* ---------- Timeline ---------- */

function Tick({
  dot
}) {
  return dot === "top" ? <>
      <div aria-hidden className={styles.Dot} />
      <div aria-hidden className={styles.TickLine} />
    </> : <>
      <div aria-hidden className={styles.TickLine} />
      <div aria-hidden className={styles.Dot} />
    </>;
}
function Timeline({
  reduceMotion
}) {
  return <section id="events" aria-label="This year's events" className={styles.TimelineScroller}>
      <ol className={styles.Track}>
        <motion.li aria-hidden initial={reduceMotion ? false : {
        scaleX: 0
      }} animate={{
        scaleX: 1
      }} transition={{
        duration: reduceMotion ? 0 : 0.8,
        delay: reduceMotion ? 0 : 0.25,
        ease: [0.22, 1, 0.36, 1]
      }} className={styles.Arrow}><div><img src={figma("timeline-arrow.svg")} alt="" /></div></motion.li>
        {timeline.map((m, index) => {
        // Animate only opacity so the CSS centering transform stays intact.
        const reveal = {
          initial: reduceMotion ? false : {
            opacity: 0
          },
          animate: {
            opacity: 1
          },
          transition: {
            duration: reduceMotion ? 0 : 0.4,
            delay: reduceMotion ? 0 : 0.45 + index * 0.08
          }
        };
        const label = <p className={styles.MilestoneLabel}>
              {m.name}
              <br />({m.date})
            </p>;
        return m.side === "above" ? <motion.li {...reveal} key={m.name} style={{
          left: `${m.x * 100}%`,
          bottom: `calc(100% - ${LINE_Y}px)`
        }} className={styles.Milestone}>
              <Link href={`/events#${m.slug}`} className={styles.MilestoneLink}>
                {label}
                <div style={{
              marginTop: 9
            }}><Tick dot="top" /></div>
              </Link>
            </motion.li> : <motion.li {...reveal} key={m.name} style={{
          left: `${m.x * 100}%`,
          top: LINE_Y
        }} className={styles.Milestone}>
              <Link href={`/events#${m.slug}`} className={styles.MilestoneLink}>
                <Tick dot="bottom" />
                <div style={{
              marginTop: 13
            }}>{label}</div>
              </Link>
            </motion.li>;
      })}
      </ol>
    </section>;
}

/* ---------- Bottom row ---------- */

export default function Hero() {
  const reduceMotion = usePrefersReducedMotion();
  return <section aria-labelledby="hero-title" className={styles.Section}>
      <motion.div aria-hidden {...entrance(reduceMotion, 0, 0)} className={styles.Glows}>
        <Glow $inset="-22.22%" style={{
        left: -200,
        top: 420,
        width: 900,
        height: 900
      }}>
          <div><img src={figma("hero-glow-bottom-left.svg")} alt="" /></div>
        </Glow>
        <Glow $inset="-25%" style={{
        right: -284,
        top: -300,
        width: 800,
        height: 800
      }}>
          <div><img src={figma("hero-glow-top-right.svg")} alt="" /></div>
        </Glow>
        <div className={styles.OrangeGlow} />
      </motion.div>

      <motion.img src={figma("hero-logo.svg")} alt="" aria-hidden initial={reduceMotion ? false : {
      opacity: 0,
      scale: 0.92,
      rotate: -8
    }} animate={{
      opacity: 1,
      scale: 1,
      rotate: 0,
      y: reduceMotion ? 0 : [0, -12, 0]
    }} transition={{
      duration: reduceMotion ? 0 : 0.9,
      delay: reduceMotion ? 0 : 0.15,
      ease: [0.22, 1, 0.36, 1],
      y: reduceMotion ? {
        duration: 0
      } : {
        duration: 5,
        delay: 1.05,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }} className={styles.HeroLogo} />
      <motion.h1 id="hero-title" {...entrance(reduceMotion, 0, 28)} className={styles.Title}>
        UBC
        <br />
        Startups
      </motion.h1>
      <motion.p {...entrance(reduceMotion, 0.12)} className={styles.Tagline}>Building a Startup Ecosystem on Campus</motion.p>

      <Timeline reduceMotion={reduceMotion} />

      <motion.div {...entrance(reduceMotion, 0.35)} className={styles.Bottom}>
        <div className={styles.Cta}>
          <p>
            UBC Startups is a student led club dedicated to supporting and fostering entrepreneurship within the UBC
            community.
          </p>
          <div className={styles.Buttons}>
            <Button href="/#subscription" variant="secondary">Subscribe to Newsletter</Button>
            <Button href="/events" variant="outline">Upcoming Events</Button>
          </div>
        </div>
      </motion.div>
    </section>;
}
