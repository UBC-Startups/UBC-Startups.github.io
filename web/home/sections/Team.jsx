"use client";

import styles from "./Team.module.css";
import { useState } from "react";
import Link from "next/link";
import { team } from "../content";
import { Button } from "../ui";
import TeamPhotoFill from "../TeamPhotoFill";
const SECONDS_PER_PERSON = 2.5;

// One copy of the list scrolls left by exactly its own width, so the duplicate
// takes its place and the loop is seamless.

// Each photo opens that person's LinkedIn; anyone without one links to the Team page.

function Avatars({
  hidden
}) {
  return team.map(m => {
    const inner = <>
        <TeamPhotoFill member={m} alt="" loading="eager" />
        <span aria-hidden className={styles.Tooltip}>
          <span className="name">{m.name}</span>
          <span className="role">{m.role}</span>
        </span>
      </>;
    // The duplicate copy (for the seamless loop) is hidden from screen readers and skipped by Tab.
    const a11y = hidden ? {
      "aria-hidden": true,
      tabIndex: -1
    } : {
      "aria-label": m.linkedIn ? `${m.name}, ${m.role}, on LinkedIn` : `${m.name}, ${m.role}`
    };
    // A member can appear in multiple roles in the flattened roster.
    return <li key={`${hidden ? "b" : "a"}-${m.name}-${m.role}`} aria-hidden={hidden || undefined} className={styles.Avatar}>
        {m.linkedIn ? <a href={m.linkedIn} target="_blank" rel="noreferrer" {...a11y} className={styles.ExternalLink}>{inner}</a> : <Link href="/meetOurTeam" onClick={() => window.scrollTo(0, 0)} {...a11y} className={styles.TeamLink}>{inner}</Link>}
      </li>;
  });
}
export default function Team() {
  const [hovering, setHovering] = useState(false);
  return <section id="team" aria-labelledby="team-title" className={styles.Section}>
      <div className={styles.Card}>
        <h2 id="team-title">
          The people behind
          <br />
          UBC Startups
        </h2>

        <div onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} onFocus={() => setHovering(true)} onBlur={() => setHovering(false)} role="region" aria-label="Team members" className={styles.Viewport}>
          <ul className={styles.Track} style={{
          "--track-0": team.length * SECONDS_PER_PERSON,
          "--track-1": hovering ? "paused" : "running"
        }}>
            <Avatars />
            <Avatars hidden />
          </ul>
        </div>

        <Button href="/meetOurTeam" variant="secondary" onClick={() => window.scrollTo(0, 0)}>
          Meet the team
        </Button>
      </div>
    </section>;
}
