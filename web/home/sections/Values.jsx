"use client";

import styles from "./Values.module.css";
import { useState } from "react";
import { color } from "../theme";
import { values } from "../content";
// Each card stays in its original position; the active one grows in place.

/**
 * Value cards stay fixed in place; clicking a card (or its dot) zooms that
 * one in without reordering or moving the others.
 */
export default function Values() {
  const [active, setActive] = useState(0);
  return <section aria-labelledby="values-title" className={styles.Section}>
      <h2 id="values-title">Our values</h2>
      <div className={styles.Stack}>
        <div className={styles.DotColumn}>
          {values.map((v, i) => <button key={v.name} type="button" aria-label={`Show ${v.name}`} aria-pressed={i === active} onClick={() => setActive(i)} className={styles.DotButton} style={{
          "--dotbutton-0": i === active ? "14px" : "10px",
          "--dotbutton-1": i === active ? "14px" : "10px",
          "--dotbutton-2": i === active ? v.dotColor : "var(--color-ink-tertiary)"
        }} />)}
        </div>

        <ul className={styles.List}>
          {values.map((v, i) => {
          const big = i === active;
          const [w, h] = big ? v.iconSize.active : v.iconSize.idle;
          return <li key={v.name}>
                <button type="button" aria-pressed={big} onClick={() => setActive(i)} className={styles.Card} style={{
              "--card-0": big ? "168px" : "128px",
              "--card-1": big ? "28px" : "20px",
              "--card-2": big ? "24px" : "16px 24px",
              "--card-3": big ? "0 12px 32px rgba(0, 0, 0, 0.1)" : "0 4px 12px rgba(0, 0, 0, 0.05)",
              "--card-4": big ? "scale(1.015)" : "scale(1)",
              "--card-5": big ? color.surface : "#fafaf8"
            }}>
                  <span aria-hidden className={styles.Accent} style={{
                "--accent-0": v.accent
              }} />
                  <span aria-hidden className={styles.IconCircle} style={{
                "--iconcircle-0": big ? "80px" : "52px",
                "--iconcircle-1": big ? "80px" : "52px",
                "--iconcircle-2": v.circle
              }}>
                    <img src={v.icon} alt="" style={{
                  width: w,
                  height: h
                }} />
                  </span>
                  <span className={styles.Text} style={{
                "--text-0": big ? "6px" : "2px",
                "--text-1": big ? "28px" : "17px",
                "--text-2": big ? "0" : "-0.02em"
              }}>
                    <span className="name">{v.name}</span>
                    <span className="body">{v.body}</span>
                  </span>
                </button>
              </li>;
        })}
        </ul>
      </div>
    </section>;
}
