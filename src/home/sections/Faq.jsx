import React, { useState } from "react";
import styled from "styled-components";
import { bp, color, figma, radius, sectionPad, type } from "../theme";
import { faqs } from "../content";

const Section = styled.section`
  ${sectionPad};
  padding-top: 112px;
  padding-bottom: 112px;
  ${bp.sm} { padding-top: 180px; padding-bottom: 180px; }
`;
const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  ${bp.lg} { flex-direction: row; align-items: flex-start; gap: 64px; }
  h2 { ${type.headingXL}; color: ${color.ink}; }
  ${bp.lg} { h2 { width: 420px; flex-shrink: 0; } }
`;
const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const Item = styled.li`
  position: relative;
  h3 { margin: 0; }
`;
const Question = styled.button`
  ${type.labelL};
  width: 100%;
  border: 0;
  cursor: pointer;
  text-align: left;
  color: ${color.ink};
  background: ${color.surface};
  padding: 24px 64px 24px 24px;
  border-radius: ${({ $open }) => ($open ? `${radius.md} ${radius.md} 0 0` : radius.md)};
  ${({ $open }) => $open && "padding-bottom: 0;"}
`;
const Answer = styled.div`
  ${type.bodyM};
  color: ${color.inkSecondary};
  background: ${color.surface};
  padding: 12px 24px 24px;
  border-radius: 0 0 ${radius.md} ${radius.md};
`;
// Chevron vectors from Figma: open points up, closed points sideways.
const ChevronBox = styled.span`
  position: absolute;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ $open }) =>
    $open
      ? "right: 27.5px; top: 37.5px; width: 16px; height: 14px;"
      : "right: 28.5px; top: 36.5px; width: 14px; height: 16px;"}
  & > span { flex: none; transform: rotate(${({ $open }) => ($open ? "180deg" : "90deg")}); }
  & > span > span { position: relative; display: block; width: 16px; height: 14px; }
  & > span > span > span { position: absolute; top: 5.83%; right: 12.05%; bottom: 25%; left: 12.05%; }
  img { display: block; width: 100%; height: 100%; max-width: none; }
`;

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <Section id="faq" aria-labelledby="faq-title">
      <Row>
        <h2 id="faq-title">Frequently asked questions</h2>
        <List>
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Item key={f.q}>
                <h3>
                  <Question
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    $open={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    {f.q}
                  </Question>
                </h3>
                {isOpen && (
                  <Answer id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
                    {f.a}
                  </Answer>
                )}
                <ChevronBox aria-hidden $open={isOpen}>
                  <span><span><span>
                    <img src={figma(isOpen ? "chevron-open.svg" : "chevron-closed.svg")} alt="" />
                  </span></span></span>
                </ChevronBox>
              </Item>
            );
          })}
        </List>
      </Row>
    </Section>
  );
}
