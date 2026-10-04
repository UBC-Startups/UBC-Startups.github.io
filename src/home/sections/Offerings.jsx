import React from "react";
import styled from "styled-components";
import { bp, color, radius, sectionPad, type } from "../theme";
import { programs } from "../content";

const Section = styled.section`
  ${sectionPad};
  display: flex;
  flex-direction: column;
  gap: 64px;
  padding-top: 80px;
  ${bp.sm} { padding-top: 100px; }
  header { display: flex; flex-direction: column; gap: 4px; color: ${color.ink}; }
  h2 { ${type.headingXL}; }
  header p { ${type.headingM}; }
`;
const Grid = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
  ${bp.md} { grid-template-columns: repeat(3, 1fr); }
`;
const Card = styled.li`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border-radius: ${radius.lg};
  background: ${color.surface};
`;
const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 4px;
  h3 { ${type.labelL}; color: ${color.ink}; }
  img { display: block; width: 29px; height: 7px; }
`;
const Visual = styled.div`
  flex: 1;
  min-height: 400px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 64px;
  padding: 24px;
  border-radius: ${radius.md};
  overflow: hidden;
  color: ${color.inkInverse};
  background: linear-gradient(${({ $from }) => $from}, ${({ $to }) => $to});
  .number { ${type.displayM}; align-self: flex-end; opacity: 0.12; }
  .body { ${type.bodyL}; }
`;

export default function Offerings() {
  return (
    <Section aria-labelledby="offer-title">
      <header>
        <h2 id="offer-title">What we offer</h2>
        <p>↳ networking, workshops &amp; resources</p>
      </header>
      <Grid>
        {programs.map((p) => (
          <Card key={p.name}>
            <Head>
              <h3>{p.name}</h3>
              <img src={p.dots} alt="" aria-hidden />
            </Head>
            <Visual $from={p.from} $to={p.to}>
              <p className="number" aria-hidden>{p.number}</p>
              <p className="body">{p.body}</p>
            </Visual>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}
