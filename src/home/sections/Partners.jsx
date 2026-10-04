import React from "react";
import styled from "styled-components";
import { bp, color, radius, sectionPad, type } from "../theme";
import { partners } from "../content";

const Section = styled.section`
  ${sectionPad};
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 64px;
  ${bp.sm} { padding-top: 63px; }
  h2 { ${type.headingXL}; color: ${color.ink}; text-align: center; }
`;
const Grid = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  ${bp.sm} { grid-template-columns: repeat(3, 1fr); }
  ${bp.lg} { grid-template-columns: repeat(6, 1fr); }
`;
const Tile = styled.li`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  padding: 0 16px;
  background: ${color.surface};
  border-radius: ${radius.md};
  img { max-width: 100%; object-fit: contain; }
`;

export default function Partners() {
  return (
    <Section aria-labelledby="partners-title">
      <h2 id="partners-title">Our Partners</h2>
      <Grid>
        {partners.map((p) => (
          <Tile key={p.name}>
            <img src={p.logo} alt={p.name} style={{ width: p.width, height: p.height }} />
          </Tile>
        ))}
      </Grid>
    </Section>
  );
}
