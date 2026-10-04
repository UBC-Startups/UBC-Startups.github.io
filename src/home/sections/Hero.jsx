import React from "react";
import styled from "styled-components";
import { bp, color, figma, radius, type } from "../theme";
import { featuredEvent, timeline } from "../content";
import { Button, Glow } from "../ui";

const LINE_Y = 67; // distance from top of the timeline box to the arrow

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
const Glows = styled.div`
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
const HeroLogo = styled.img`
  position: absolute;
  right: 67px;
  top: 93px;
  display: none;
  width: clamp(160px, 20.5vw, 290px);
  height: clamp(160px, 20.5vw, 290px);
  ${bp.md} { display: block; }
`;
const Title = styled.h1`
  ${type.displayXL};
  color: ${color.inkInverse};
`;
const Tagline = styled.p`
  ${type.headingM};
  color: ${color.inkInverse};
  margin-top: 8px;
  ${bp.sm} { margin-left: 12px; }
`;

/* ---------- Timeline ---------- */
const TimelineScroller = styled.section`
  margin: 56px -20px 0;
  padding: 0 20px;
  overflow-x: auto;
  ${bp.sm} { margin: 56px -36px 0; padding: 0 36px; }
  ${bp.lg} { margin-top: 65px; }
`;
const Track = styled.ol`
  position: relative;
  list-style: none;
  margin: 0 38px 0 20px;
  padding: 0;
  height: 134px;
  min-width: 860px;
`;
const Arrow = styled.li`
  position: absolute;
  left: 0;
  right: 0;
  top: ${LINE_Y}px;
  height: 0;
  div { position: absolute; inset: -7.36px 0; }
  img { display: block; width: 100%; height: 100%; max-width: none; }
`;
const Milestone = styled.li`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateX(-50%);
`;
const MilestoneLabel = styled.p`
  ${type.labelM};
  color: #fff;
  text-align: center;
  white-space: nowrap;
`;
// Tick + dot vectors from Figma, reproduced with the same geometry.
const TickBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 0;
  height: 23.087px;
  & > div { flex: none; transform: rotate(-90deg); }
  & > div > div { position: relative; width: 23.087px; height: 0; }
  & > div > div > div { position: absolute; inset: -1px 0 0 0; }
  img { display: block; width: 100%; height: 100%; max-width: none; }
`;
const DotImg = styled.img`
  position: absolute;
  left: 0;
  width: 7px;
  height: 7px;
  max-width: none;
  transform: translateX(-50%);
  ${({ $at }) => ($at === "top" ? "top: -3.5px;" : "bottom: -3.5px;")}
`;

function Tick({ dot }) {
  return (
    <div style={{ position: "relative" }}>
      <TickBox aria-hidden>
        <div><div><div><img src={figma("timeline-tick.svg")} alt="" /></div></div></div>
      </TickBox>
      <DotImg src={figma("timeline-dot.svg")} alt="" aria-hidden $at={dot} />
    </div>
  );
}

function Timeline() {
  return (
    <TimelineScroller id="events" aria-label="This year's events">
      <Track>
        <Arrow aria-hidden><div><img src={figma("timeline-arrow.svg")} alt="" /></div></Arrow>
        {timeline.map((m) => {
          const label = (
            <MilestoneLabel>
              {m.name}
              <br />({m.date})
            </MilestoneLabel>
          );
          return m.side === "above" ? (
            <Milestone key={m.name} style={{ left: `${m.x * 100}%`, bottom: `calc(100% - ${LINE_Y}px)` }}>
              {label}
              <div style={{ marginTop: 9 }}><Tick dot="top" /></div>
            </Milestone>
          ) : (
            <Milestone key={m.name} style={{ left: `${m.x * 100}%`, top: LINE_Y }}>
              <Tick dot="bottom" />
              <div style={{ marginTop: 13 }}>{label}</div>
            </Milestone>
          );
        })}
      </Track>
    </TimelineScroller>
  );
}

/* ---------- Bottom row ---------- */
const Bottom = styled.div`
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
`;
const Card = styled.article`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: max-content;
  max-width: 100%;
  background: ${color.surface};
  border-radius: ${radius.lg};
  padding: 8px 16px 8px 8px;
  ${bp.lg} { margin-bottom: 34px; }
`;
const CardImage = styled.img`
  flex-shrink: 0;
  width: 132px;
  height: 150px;
  object-fit: cover;
  object-position: top;
  border-radius: ${radius.sm};
`;
const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 170px;
  padding-top: 4px;
`;

function EventCard() {
  return (
    <Card>
      <CardImage src={featuredEvent.image} alt="" />
      <CardInfo>
        <p style={{ color: color.inkSecondary }} className="caption">{featuredEvent.status}</p>
        <h2 style={{ color: color.ink }}>
          {featuredEvent.title[0]}
          <br />
          {featuredEvent.title[1]}
        </h2>
        <p style={{ color: color.inkSecondary }} className="body">{featuredEvent.blurb}</p>
        <div style={{ height: 8 }} />
        <Button to={featuredEvent.to} variant="primary">Learn more</Button>
      </CardInfo>
    </Card>
  );
}

const CardText = styled.div`
  .caption { ${type.caption}; }
  h2 { ${type.headingS}; }
  .body { ${type.bodyS}; }
`;

export default function Hero() {
  return (
    <Section aria-labelledby="hero-title">
      <Glows aria-hidden>
        <Glow $inset="-22.22%" style={{ left: -200, top: 420, width: 900, height: 900 }}>
          <div><img src={figma("hero-glow-bottom-left.svg")} alt="" /></div>
        </Glow>
        <Glow $inset="-25%" style={{ right: -284, top: -300, width: 800, height: 800 }}>
          <div><img src={figma("hero-glow-top-right.svg")} alt="" /></div>
        </Glow>
        <OrangeGlow />
      </Glows>

      <HeroLogo src={figma("hero-logo.svg")} alt="" aria-hidden />
      <Title id="hero-title">
        UBC
        <br />
        Startups
      </Title>
      <Tagline>building a startup ecosystem on campus</Tagline>

      <Timeline />

      <Bottom>
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
        <CardText>
          <EventCard />
        </CardText>
      </Bottom>
    </Section>
  );
}
