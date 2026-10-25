"use client";

import styles from "./Faq.module.css";
import { useState } from "react";
import { figma, radius } from "../theme";
import { faqs } from "../content";

// Chevron vectors from Figma: open points up, closed points sideways.

export default function Faq() {
  const [open, setOpen] = useState(0);
  return <section id="faq" aria-labelledby="faq-title" className={styles.Section}>
      <div className={styles.Row}>
        <h2 id="faq-title">Frequently asked questions</h2>
        <ul className={styles.List}>
          {faqs.map((f, i) => {
          const isOpen = open === i;
          return <li key={f.q} className={styles.Item}>
                <h3>
                  <button type="button" id={`faq-q-${i}`} aria-expanded={isOpen} aria-controls={`faq-a-${i}`} onClick={() => setOpen(current => current === i ? null : i)} className={styles.Question} style={{
                "--question-0": isOpen ? `${radius.md} ${radius.md} 0 0` : radius.md,
                "--question-1": isOpen ? "0" : "24px"
              }}>
                    {f.q}
                    <span aria-hidden className={styles.ChevronBox} style={{
                  "--chevronbox-0": isOpen ? "27.5px" : "28.5px",
                  "--chevronbox-1": isOpen ? "16px" : "14px",
                  "--chevronbox-2": isOpen ? "14px" : "16px",
                  "--chevronbox-3": isOpen ? "180deg" : "90deg"
                }}>
                      <span><span><span>
                        <img src={figma(isOpen ? "chevron-open.svg" : "chevron-closed.svg")} alt="" />
                      </span></span></span>
                    </span>
                  </button>
                </h3>
                <div aria-hidden={!isOpen} className={styles.AnswerWrapper} style={{
              "--answerwrapper-0": isOpen ? "1fr" : "0fr"
            }}>
                  <div className={styles.AnswerInner}>
                    <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className={styles.Answer}>
                      {f.a}
                    </div>
                  </div>
                </div>
              </li>;
        })}
        </ul>
      </div>
    </section>;
}
