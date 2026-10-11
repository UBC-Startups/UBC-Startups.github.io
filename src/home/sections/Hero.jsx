import React from "react";
import styled from "styled-components";
import { motion, useReducedMotion } from "motion/react";
import { HashLink } from "react-router-hash-link";
import { bp, color, figma, radius, type } from "../theme";
import { timeline } from "../content";
import { Button, Glow } from "../ui";

const LINE_Y = 95; // distance from top of the timeline box to the arrow

const entrance = (reduceMotion, delay = 0, distance = 20) => ({
  initial: reduceMotion ? false : { opacity: 0, y: distance },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: reduceMotion ? 0 : 0.7,
    delay: reduceMotion ? 0 : delay,
    ease: [0.22, 1, 0.36, 1],
  },
});

const Section = styled.section`
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: ${radius.xl};
  background: ${color.inverse};
  padding: 40px 20px;
  ${bp.sm} { padding: 51px 36px 40px; }
  ${bp.lg} { min-height: 947px; padding-bottom: 48px; }
`;
const Glows = styled(motion.div)`
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
`;
const OrangeGlow = styled.div`
  position: absolute;
  left: -420px;
  top: 360px;
  width: 1400px;
  height: 1000px;
  background: radial-gradient(700px 500px at 50% 50%, rgba(255, 90, 31, 0.42) 0%, rgba(255, 90, 31, 0.14) 45%, rgba(255, 90, 31, 0) 100%);
`;
const HeroLogo = styled(motion.img)`
  position: absolute;
  right: 67px;
  top: 93px;
  display: none;
  width: clamp(180px, 23vw, 330px);
  height: clamp(180px, 23vw, 330px);
  ${bp.md} { display: block; }
`;
const Title = styled(motion.h1)`
  ${type.displayXL};
  font-size: clamp(56px, 11vw, 160px);
  color: ${color.inkInverse};
`;
const Tagline = styled(motion.p)`
  ${type.headingM};
  color: ${color.inkInverse};
  margin-top: 52px !important;
  ${bp.sm} { margin-left: 12px; }
`;

/* ---------- Timeline ---------- */
const TimelineScroller = styled.section`
  margin: 60px -20px 0;
  padding: 0 20px;
  overflow-x: auto;
  ${bp.sm} { margin: 60px -36px 0; padding: 0 36px; }
  ${bp.lg} { margin-top: 70px; }
`;
const Track = styled.ol`
  position: relative;
  list-style: none;
  margin: 0 38px 0 20px;
  padding: 0;
  height: 190px;
  min-width: 860px;
`;
const Arrow = styled(motion.li)`
  position: absolute;
  left: 0;
  right: 0;
  top: ${LINE_Y}px;
  height: 0;
  transform-origin: left center;
  div { position: absolute; inset: -7.36px 0; }
  img { display: block; width: 100%; height: 100%; max-width: none; }
`;
const Milestone = styled(motion.li)`
  position: absolute;
  transform: translateX(-50%);
`;
const MilestoneLink = styled(HashLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #fff;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;

  &:hover {
    color: ${color.accent};
    transform: scale(1.08);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover { transform: none; }
  }
`;
const MilestoneLabel = styled.p`
  ${type.labelM};
  color: inherit;
  text-align: center;
  white-space: nowrap;
  padding: 4px 10px;
  border-radius: ${radius.full};
  background: rgba(255, 255, 255, 0);
  transition: background 0.2s;

  ${MilestoneLink}:hover & {
    background: rgba(255, 90, 31, 0.14);
  }
`;
const TickLine = styled.div`
  width: 1px;
  height: 23px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.5);
  transition: background 0.2s;

  ${MilestoneLink}:hover & {
    background: ${color.accent};
  }
`;
const Dot = styled.div`
  position: relative;
  width: 9px;
  height: 9px;
  margin: 0 auto;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.12);
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;

  ${MilestoneLink}:hover & {
    background: ${color.accent};
    box-shadow: 0 0 0 6px rgba(255, 90, 31, 0.25);
    transform: scale(1.15);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    ${MilestoneLink}:hover & { transform: none; }
  }
`;

function Tick({ dot }) {
  return dot === "top" ? (
    <>
      <Dot aria-hidden />
      <TickLine aria-hidden />
    </>
  ) : (
    <>
      <TickLine aria-hidden />
      <Dot aria-hidden />
    </>
  );
}

function Timeline({ reduceMotion }) {
  return (
    <TimelineScroller id="events" aria-label="This year's events">
      <Track>
        <Arrow
          aria-hidden
          initial={reduceMotion ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
        ><div><img src={figma("timeline-arrow.svg")} alt="" /></div></Arrow>
        {timeline.map((m, index) => {
          // Animate only opacity so the CSS centering transform stays intact.
          const reveal = {
            initial: reduceMotion ? false : { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : 0.45 + index * 0.08 },
          };
          const label = (
            <MilestoneLabel>
              {m.name}
              <br />({m.date})
            </MilestoneLabel>
          );
          return m.side === "above" ? (
            <Milestone {...reveal} key={m.name} style={{ left: `${m.x * 100}%`, bottom: `calc(100% - ${LINE_Y}px)` }}>
              <MilestoneLink smooth={!reduceMotion} to={`/events#${m.slug}`}>
                {label}
                <div style={{ marginTop: 9 }}><Tick dot="top" /></div>
              </MilestoneLink>
            </Milestone>
          ) : (
            <Milestone {...reveal} key={m.name} style={{ left: `${m.x * 100}%`, top: LINE_Y }}>
              <MilestoneLink smooth={!reduceMotion} to={`/events#${m.slug}`}>
                <Tick dot="bottom" />
                <div style={{ marginTop: 13 }}>{label}</div>
              </MilestoneLink>
            </Milestone>
          );
        })}
      </Track>
    </TimelineScroller>
  );
}

/* ---------- Bottom row ---------- */
const Bottom = styled(motion.div)`
  margin-top: 56px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  ${bp.lg} {
    margin-top: auto;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
`;
const Cta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  p { ${type.bodyXL}; color: ${color.inkInverse}; max-width: 560px; }
`;
const Buttons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  a {
    transition: transform 0.2s, box-shadow 0.2s;
  }
  a:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
  }

  @media (prefers-reduced-motion: reduce) {
    a { transition: none; }
    a:hover { transform: none; }
  }
`;
export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <Section aria-labelledby="hero-title">
      <Glows aria-hidden {...entrance(reduceMotion, 0, 0)}>
        <Glow $inset="-22.22%" style={{ left: -200, top: 420, width: 900, height: 900 }}>
          <div><img src={figma("hero-glow-bottom-left.svg")} alt="" /></div>
        </Glow>
        <Glow $inset="-25%" style={{ right: -284, top: -300, width: 800, height: 800 }}>
          <div><img src={figma("hero-glow-top-right.svg")} alt="" /></div>
        </Glow>
        <OrangeGlow />
      </Glows>

      <HeroLogo
        src={figma("hero-logo.svg")}
        alt=""
        aria-hidden
        initial={reduceMotion ? false : { opacity: 0, scale: 0.92, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0, y: reduceMotion ? 0 : [0, -12, 0] }}
        transition={{
          duration: reduceMotion ? 0 : 0.9,
          delay: reduceMotion ? 0 : 0.15,
          ease: [0.22, 1, 0.36, 1],
          y: reduceMotion
            ? { duration: 0 }
            : { duration: 5, delay: 1.05, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      <Title id="hero-title" {...entrance(reduceMotion, 0, 28)}>
        UBC
        <br />
        Startups
      </Title>
      <Tagline {...entrance(reduceMotion, 0.12)}>Building a Startup Ecosystem on Campus</Tagline>

      <Timeline reduceMotion={reduceMotion} />

      <Bottom {...entrance(reduceMotion, 0.35)}>
        <Cta>
          <p>
            UBC Startups is a student led club dedicated to supporting and fostering entrepreneurship within the UBC
            community.
          </p>
          <Buttons>
            <Button hash="/#subscription" variant="secondary">Subscribe to Newsletter</Button>
            <Button to="/events" variant="outline">Upcoming Events</Button>
          </Buttons>
        </Cta>
      </Bottom>
    </Section>
  );
}
