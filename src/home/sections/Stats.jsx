import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { bp, color, sectionPad, type } from "../theme";
import { stats } from "../content";

const DURATION = 1600; // ms

const Section = styled.section`
  ${sectionPad};
  padding-top: 80px;
  ${bp.sm} { padding-top: 100px; }
`;
const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 40px;
  ${bp.sm} { grid-template-columns: repeat(3, 1fr); gap: 24px; }
`;
const Stat = styled.li`
  display: flex;
  flex-direction: column;
  gap: 12px;
  &::before { content: ""; height: 3px; background: ${color.inverse}; }
  .label { ${type.labelL}; color: ${color.inkSecondary}; }
`;
// The final value sits invisibly underneath to reserve its width, so the layout
// doesn't shift while the number counts up.
const Value = styled.p`
  ${type.displayS};
  color: ${color.ink};
  white-space: nowrap;
  display: grid;
  font-variant-numeric: tabular-nums;
  & > span { grid-area: 1 / 1; }
  .reserve { visibility: hidden; }
`;

/** "$12,000+" -> { prefix: "$", target: 12000, suffix: "+" } */
function parse(value) {
  const m = value.match(/^([^\d]*)([\d,]+)(.*)$/);
  if (!m) return { prefix: "", target: 0, suffix: value };
  return { prefix: m[1], target: Number(m[2].replace(/,/g, "")), suffix: m[3] };
}

const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function CountUp({ value, start }) {
  const { prefix, target, suffix } = parse(value);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(target);
      return;
    }
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min((now - t0) / DURATION, 1);
      setN(Math.round(easeOut(t) * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target]);

  return (
    <Value aria-label={value}>
      <span className="reserve" aria-hidden>{value}</span>
      <span aria-hidden>{prefix}{n.toLocaleString("en-US")}{suffix}</span>
    </Value>
  );
}

export default function Stats() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  // Start counting the first time the stats scroll into view.
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Section aria-label="UBC Startups in numbers" ref={ref}>
      <List>
        {stats.map((s) => (
          <Stat key={s.label}>
            <CountUp value={s.value} start={visible} />
            <p className="label">{s.label}</p>
          </Stat>
        ))}
      </List>
    </Section>
  );
}
