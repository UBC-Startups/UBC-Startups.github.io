import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { bp, color, radius, sectionPad, type } from "../theme";
import { team } from "../content";
import { Button } from "../ui";
import TeamPhotoFill from "../TeamPhotoFill";

const AVATAR = 120;
const GAP = 24;
const SECONDS_PER_PERSON = 2.5;

const Section = styled.section`
  ${sectionPad};
  padding-top: 112px;
  ${bp.sm} { padding-top: 180px; }
`;
const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 64px;
  overflow: hidden;
  padding: 64px 24px;
  border-radius: ${radius.xl};
  background: ${color.inverse};
  ${bp.sm} { padding: 64px 40px; }
  h2 { ${type.headingXL}; color: ${color.inkInverse}; align-self: flex-start; max-width: 562px; }
`;

// One copy of the list scrolls left by exactly its own width, so the duplicate
// takes its place and the loop is seamless.
const scroll = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

const Viewport = styled.div`
  position: relative;
  width: calc(100% + 48px);
  margin: 0 -24px;
  overflow: hidden;
  /* Faded edges, standing in for the design's fading last avatars */
  mask-image: linear-gradient(to right, transparent 0, #000 64px, #000 calc(100% - 160px), transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 64px, #000 calc(100% - 160px), transparent 100%);
  ${bp.sm} { width: calc(100% + 80px); margin: 0 -40px; }

  @media (prefers-reduced-motion: reduce) {
    overflow-x: auto;
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
const Avatar = styled.li`
  position: relative;
  flex-shrink: 0;
  margin-right: ${GAP}px; /* margin, not gap, so each copy is exactly n × (avatar + gap) wide */
  width: ${AVATAR}px;
  height: ${AVATAR}px;
  border-radius: 50%;
  overflow: hidden;
  background: ${color.inverseSubtle};
`;
const Tooltip = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 50%;
  text-align: center;
  background: rgba(10, 10, 10, 0.78);
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s;
  ${Avatar}:hover & { opacity: 1; }
  .name { ${type.labelM}; font-weight: 600; }
  .role { ${type.caption}; color: ${color.inkInverseMuted}; margin-top: 2px; }
`;
const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
const PauseButton = styled.button`
  ${type.labelM};
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: transparent;
  color: ${color.inkInverse};
  border-radius: 999px;
  padding: 11px 18px;
  cursor: pointer;
  &:hover { border-color: #fff; }
  @media (prefers-reduced-motion: reduce) { display: none; }
`;

function Avatars({ hidden }) {
  return team.map((m) => (
    <Avatar key={(hidden ? "b-" : "a-") + m.name} aria-hidden={hidden || undefined}>
      <TeamPhotoFill member={m} alt={hidden ? "" : `${m.name}, ${m.role}`} loading="eager" />
      <Tooltip aria-hidden>
        <span className="name">{m.name}</span>
        <span className="role">{m.role}</span>
      </Tooltip>
    </Avatar>
  ));
}

export default function Team() {
  const [hovering, setHovering] = useState(false);
  const [stopped, setStopped] = useState(false);

  return (
    <Section id="team" aria-labelledby="team-title">
      <Card>
        <h2 id="team-title">
          The people behind
          <br />
          UBC Startups
        </h2>

        <Viewport
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          aria-label="Team members"
          role="region"
        >
          <Track $duration={team.length * SECONDS_PER_PERSON} $paused={hovering || stopped}>
            <Avatars />
            <Avatars hidden />
          </Track>
        </Viewport>

        <Controls>
          <Button to="/meetOurTeam" variant="secondary" onClick={() => window.scrollTo(0, 0)}>
            Meet the team
          </Button>
          <PauseButton type="button" aria-pressed={stopped} onClick={() => setStopped((s) => !s)}>
            {stopped ? "Play" : "Pause"}
          </PauseButton>
        </Controls>
      </Card>
    </Section>
  );
}
