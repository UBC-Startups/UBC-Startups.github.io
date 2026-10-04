import React from "react";
import styled from "styled-components";

import Layout from "../home/Layout";
import PageHero from "../home/sections/PageHero";
import { bp, color, figma, sectionPad } from "../home/theme";
import { teamSections } from "../data/team";

// Team page redesign (Figma: "UBC Startups — Website Remix", TEAM PAGE frame).
// Roster data still comes from src/data/team.js.

const Section = styled.section`
  ${sectionPad};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 80px;
  padding-top: 96px;
  padding-bottom: 160px;
  ${bp.sm} { gap: 120px; padding-top: 140px; padding-bottom: 280px; }
  & > h2 {
    font-size: clamp(36px, 4.5vw, 64px);
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.04em;
    text-align: center;
    color: ${color.ink};
  }
`;
const Group = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
  ${bp.sm} { gap: 64px; }
  h3 { font-size: clamp(28px, 2.6vw, 36px); font-weight: 600; color: ${color.ink}; text-align: center; }
`;
const Row = styled.ul`
  width: 100%;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 48px 24px;
  ${bp.sm} { gap: 64px 48px; }
`;
const Member = styled.li`
  width: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
  ${bp.sm} { width: 240px; }
  .name { font-size: clamp(19px, 1.7vw, 24px); font-weight: 600; color: ${color.ink}; margin-top: 18px; }
  .role { font-size: clamp(15px, 1.25vw, 18px); font-weight: 500; color: ${color.ink}; }
  a { font-size: 15px; color: ${color.inkSecondary}; text-decoration: none; }
  a:hover { color: ${color.accent}; text-decoration: underline; }
`;
const Photo = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid ${color.inkTertiary};
  background: ${color.surface};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  ${bp.sm} { width: 160px; height: 160px; }
  img.photo { width: 100%; height: 100%; object-fit: cover; display: block; }
  img.placeholder { width: 40%; height: 40%; opacity: 0.35; }
`;
// Same ring as the frames baked into the older portraits, so every photo matches.
const Ring = styled.div`
  width: 100%;
  height: 100%;
  padding: 6px;
  border-radius: 50%;
  background: conic-gradient(from 45deg, #ff9933, #87dabe, #e42e1c, #87dabe, #ff9933);
  & > div { width: 100%; height: 100%; border: 4px solid #000; border-radius: 50%; overflow: hidden; }
`;

function TeamPhoto({ m }) {
  if (!m.image) {
    return (
      <Photo>
        <img className="placeholder" src={figma("logo-mark.svg")} alt="" />
      </Photo>
    );
  }
  const img = (
    <img
      className="photo"
      src={m.image}
      alt={m.name}
      loading="lazy"
      style={{
        objectPosition: m.photoPosition || "center",
        transform: `scale(${m.photoScale || 1})`,
        transformOrigin: m.photoOrigin || "center",
      }}
    />
  );
  return <Photo>{m.photoFrame ? <Ring><div>{img}</div></Ring> : img}</Photo>;
}

function MemberCard({ m }) {
  return (
    <Member>
      <TeamPhoto m={m} />
      <p className="name">{m.name}</p>
      <p className="role">{m.role}</p>
      {m.linkedIn && (
        <a href={m.linkedIn} target="_blank" rel="noreferrer" aria-label={`${m.name} on LinkedIn`}>
          LinkedIn
        </a>
      )}
    </Member>
  );
}

// Leadership puts the presidents on their own row, as in the design.
function rowsFor(title, members) {
  if (title !== "Leadership") return [members];
  const presidents = members.filter((m) => /president/i.test(m.role) && !/vice|vp/i.test(m.role));
  const rest = members.filter((m) => !presidents.includes(m));
  return presidents.length ? [presidents, rest] : [members];
}

const MeetOurTeam = () => (
  <Layout title="Team | UBC Startups" active="Team" footerTitle="Stay in the loop.">
    <PageHero eyebrow="Team 2026–27" title="Team" subtitle="The people behind UBC Startups." />
    <Section aria-labelledby="exec-title">
      <h2 id="exec-title">Meet the 2026/27 exec team</h2>
      {teamSections.map(({ title, members }) => (
        <Group key={title} aria-label={title}>
          <h3>{title}</h3>
          {rowsFor(title, members).map((row, i) => (
            <Row key={i}>
              {row.map((m) => <MemberCard key={m.name} m={m} />)}
            </Row>
          ))}
        </Group>
      ))}
    </Section>
  </Layout>
);

export default MeetOurTeam;
