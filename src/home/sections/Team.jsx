import React from "react";
import styled from "styled-components";
import { bp, color, radius, sectionPad, type } from "../theme";
import { team } from "../content";
import { Button } from "../ui";

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
const Avatars = styled.ul`
  list-style: none;
  margin: 0 -24px;
  padding: 0 24px;
  width: calc(100% + 48px);
  display: flex;
  gap: 16px;
  overflow-x: auto;
  ${bp.sm} { margin: 0; padding: 0; width: 100%; }
  ${bp.xl} { justify-content: space-between; overflow: visible; }
`;
const Avatar = styled.li`
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: ${color.inverseSubtle};
  opacity: ${({ $fade }) => $fade};
  img { width: 100%; height: 100%; object-fit: cover; object-position: ${({ $pos }) => $pos || "50% 50%"}; }
`;

// The last two avatars fade out in the design to hint there are more people.
const fade = (i, n) => (i === n - 2 ? 0.55 : i === n - 1 ? 0.2 : 1);

export default function Team() {
  return (
    <Section id="team" aria-labelledby="team-title">
      <Card>
        <h2 id="team-title">
          The people behind
          <br />
          UBC Startups
        </h2>
        <Avatars>
          {team.map((m, i) => (
            <Avatar key={m.name} $fade={fade(i, team.length)} $pos={m.photoPosition}>
              <img src={m.image} alt={`${m.name}, ${m.role}`} />
            </Avatar>
          ))}
        </Avatars>
        <Button to="/meetOurTeam" variant="secondary" onClick={() => window.scrollTo(0, 0)}>
          Meet the team
        </Button>
      </Card>
    </Section>
  );
}
