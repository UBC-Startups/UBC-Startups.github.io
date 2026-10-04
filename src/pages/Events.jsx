import React from "react";
import styled from "styled-components";

import Layout from "../home/Layout";
import PageHero from "../home/sections/PageHero";
import { Button } from "../home/ui";
import { bp, color, radius, sectionPad, type } from "../home/theme";
import { terms } from "../home/events";

// Events page redesign (Figma: "UBC Startups — Website Remix", EVENTS PAGE frame).
// Past events from the previous version of this page are in git history.

const Term = styled.section`
  ${sectionPad};
  display: flex;
  flex-direction: column;
  gap: 48px;
  padding-top: ${({ $first }) => ($first ? "80px" : "100px")};
  padding-bottom: ${({ $last }) => ($last ? "120px" : "0")};
  ${bp.sm} {
    padding-top: ${({ $first }) => ($first ? "120px" : "140px")};
    padding-bottom: ${({ $last }) => ($last ? "160px" : "0")};
  }
`;
const TermHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px 24px;
  h2 { ${type.headingXL}; color: ${color.ink}; }
  p { ${type.bodyM}; color: ${color.inkSecondary}; }
`;
const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const Card = styled.li`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 8px;
  border-radius: ${radius.lg};
  background: ${color.surface};
  ${bp.md} { flex-direction: row; align-items: stretch; }
`;
const Visual = styled.div`
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 48px;
  min-height: 240px;
  padding: 28px;
  border-radius: ${radius.md};
  background: linear-gradient(${({ $g }) => $g[0]}, ${({ $g }) => $g[1]});
  ${bp.md} { width: 360px; }
`;
const Number = styled.p`
  position: absolute;
  top: 12px;
  right: 0;
  font-size: 120px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.14);
`;
const Tags = styled.ul`
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;
const Tag = styled.li`
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  background: ${({ $light }) => ($light ? "#fff" : "rgba(255, 255, 255, 0.16)")};
  color: ${({ $light }) => ($light ? color.ink : "#fff")};
`;
const When = styled.div`
  position: relative;
  color: #fff;
  white-space: nowrap;
  .date { font-size: clamp(40px, 3.6vw, 52px); font-weight: 600; line-height: 1.1; }
  .year { font-size: 17px; color: rgba(255, 255, 255, 0.7); }
`;
const Content = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  padding: 24px 16px 16px;
  ${bp.sm} { padding: 32px 40px; }
  h3 { font-size: clamp(28px, 2.4vw, 34px); font-weight: 600; line-height: 1.15; color: ${color.ink}; }
  .description { ${type.bodyM}; color: ${color.inkSecondary}; }
`;
const Highlight = styled.p`
  ${type.bodyM};
  width: 100%;
  padding: 14px 18px;
  border-radius: ${radius.sm};
  background: ${color.canvas};
  color: ${color.ink};
`;
const Details = styled.dl`
  width: 100%;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 400px));
  gap: 20px 32px;
  div { display: flex; flex-direction: column; gap: 4px; }
  dt { font-size: 12px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: ${color.inkSecondary}; }
  dd { margin: 0; font-size: 15px; font-weight: 500; line-height: 1.4; color: ${color.ink}; }
`;

function SignUp({ href }) {
  if (!href) return null;
  if (href.startsWith("/")) return <Button to={href} variant="primary">Sign up</Button>;
  return <Button href={href} variant="primary">Sign up</Button>;
}

function EventCard({ event, term }) {
  return (
    <Card>
      <Visual $g={event.gradient}>
        <Number aria-hidden>{event.number}</Number>
        <Tags aria-label="Tags">
          <Tag>{term}</Tag>
          {event.tags.map((t) => <Tag key={t} $light>{t}</Tag>)}
        </Tags>
        <When>
          <p className="date">{event.date}</p>
          <p className="year">{event.year}</p>
        </When>
      </Visual>
      <Content>
        <h3>{event.name}</h3>
        <p className="description">{event.description}</p>
        {event.highlight && <Highlight>{event.highlight}</Highlight>}
        <Details>
          {Object.entries(event.details).map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </Details>
        <SignUp href={event.signup} />
      </Content>
    </Card>
  );
}

const Events = () => (
  <Layout title="Events | UBC Startups" active="Events" footerTitle="Stay in the loop.">
    <PageHero
      eyebrow="Events 2026–27"
      title="Events"
      subtitle="Six events across two terms, from our September kickoff to SOAR in March."
    />
    {terms.map((t, i) => (
      <Term key={t.name} aria-labelledby={`term-${i}`} $first={i === 0} $last={i === terms.length - 1}>
        <TermHeader>
          <h2 id={`term-${i}`}>{t.name}</h2>
          <p>{t.range}</p>
        </TermHeader>
        <List>
          {t.events.map((e) => <EventCard key={e.name} event={e} term={t.name} />)}
        </List>
      </Term>
    ))}
  </Layout>
);

export default Events;
