import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { bp, color, radius, sectionPad, type } from "../theme";
import { partners } from "../content";

const TILE_W = 200;
const TILE_W_SM = 160;
const GAP = 12;
const SECONDS_PER_LOGO = 3;

const Section = styled.section`
  ${sectionPad};
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 64px;
  ${bp.sm} { padding-top: 63px; }
  h2 { ${type.headingXL}; color: ${color.ink}; text-align: center; }
`;

// One copy of the list scrolls left by exactly its own width, so the duplicate
// takes its place and the loop is seamless (same technique as Team.jsx).
const scroll = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

const Viewport = styled.div`
  position: relative;
  overflow: hidden;
  /* Bleed to the screen edges and fade the logos out at both ends */
  margin: 0 -16px;
  ${bp.sm} { margin: 0 -32px; }
  mask-image: linear-gradient(to right, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%);

  @media (prefers-reduced-motion: reduce) {
    overflow-x: auto;
    mask-image: none;
    -webkit-mask-image: none;
  }
`;
const Track = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  width: max-content;
  animation: ${scroll} ${({ $duration }) => $duration}s linear infinite;
  animation-play-state: ${({ $paused }) => ($paused ? "paused" : "running")};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
const Tile = styled.li`
  flex-shrink: 0;
  /* margin, not gap, so each copy is exactly n × (tile + gap) wide */
  margin-right: ${GAP}px;
  width: ${TILE_W_SM}px;
  height: 104px;
  ${bp.sm} { width: ${TILE_W}px; height: 120px; }
  border-radius: ${radius.md};
  background: ${color.surface};
  overflow: hidden;

  > a, > div {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
  > a:focus-visible { outline: 2px solid ${color.accent}; outline-offset: -2px; border-radius: ${radius.md}; }

  img {
    display: block;
    width: auto;
    max-width: 100%;
    max-height: 80%;
    object-fit: contain;
    transition: transform 0.2s;
  }
  &:hover img { transform: scale(1.04); }
`;

function Logos({ hidden }) {
  return partners.map((p) => {
    const img = (
      <img
        src={p.logo}
        alt={hidden ? "" : p.name}
        style={{ height: p.height }}
        loading="eager"
        draggable={false}
      />
    );
    return (
      <Tile key={(hidden ? "b-" : "a-") + p.name} aria-hidden={hidden || undefined}>
        {p.url ? (
          <a href={p.url} target="_blank" rel="noreferrer" tabIndex={hidden ? -1 : undefined}>
            {img}
          </a>
        ) : (
          <div>{img}</div>
        )}
      </Tile>
    );
  });
}

export default function Partners() {
  const [paused, setPaused] = useState(false);

  return (
    <Section aria-labelledby="partners-title">
      <h2 id="partners-title">Our Partners</h2>
      <Viewport
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <Track
          $duration={partners.length * SECONDS_PER_LOGO}
          $paused={paused}
          aria-label="Our partners and sponsors"
        >
          <Logos />
          <Logos hidden />
        </Track>
      </Viewport>
    </Section>
  );
}
