import React from "react";
import styled from "styled-components";
import { bp, color, figma, font, radius } from "../theme";
import { Glow } from "../ui";

const Section = styled.section`
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 12px;
  overflow: hidden;
  min-height: 380px;
  padding: 40px 24px;
  border-radius: ${radius.xl};
  background: ${color.inverse};
  font-family: ${font};
  ${bp.sm} { min-height: 560px; padding: 48px 48px 56px; }
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
const Eyebrow = styled.p`
  font-size: 17px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
`;
const Title = styled.h1`
  font-size: clamp(72px, 12.7vw, 180px);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.03em;
  color: #fff;
`;
const Subtitle = styled.p`
  font-size: clamp(19px, 2vw, 28px);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
`;

/** Dark hero used at the top of the Events and Team pages. */
export default function PageHero({ eyebrow, title, subtitle }) {
  return (
    <Section aria-labelledby="page-title">
      <Glows aria-hidden>
        <Glow $inset="-22.22%" style={{ left: -200, top: 420, width: 900, height: 900 }}>
          <div><img src={figma("page-hero-glow-bottom-left.svg")} alt="" /></div>
        </Glow>
        <Glow $inset="-25%" style={{ left: 900, top: -300, width: 800, height: 800 }}>
          <div><img src={figma("page-hero-glow-top-right.svg")} alt="" /></div>
        </Glow>
        <OrangeGlow />
      </Glows>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Title id="page-title">{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
    </Section>
  );
}
