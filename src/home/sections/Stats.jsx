import React from "react";
import styled from "styled-components";
import { bp, color, sectionPad, type } from "../theme";
import { stats } from "../content";

const Section = styled.section`
  ${sectionPad};
  padding-top: 80px;
  ${bp.sm} { padding-top: 100px; }
`;
const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 40px;
  ${bp.sm} { grid-template-columns: repeat(3, 1fr); gap: 24px; }
`;
const Stat = styled.li`
  display: flex;
  flex-direction: column;
  gap: 12px;
  &::before { content: ""; height: 3px; background: ${color.inverse}; }
  .value { ${type.displayS}; color: ${color.ink}; white-space: nowrap; }
  .label { ${type.labelL}; color: ${color.inkSecondary}; }
`;

export default function Stats() {
  return (
    <Section aria-label="UBC Startups in numbers">
      <List>
        {stats.map((s) => (
          <Stat key={s.label}>
            <p className="value">{s.value}</p>
            <p className="label">{s.label}</p>
          </Stat>
        ))}
      </List>
    </Section>
  );
}
