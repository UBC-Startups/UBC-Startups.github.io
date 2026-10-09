import React, { useState } from "react";
import styled, { css } from "styled-components";
import { bp, color, radius, sectionPad, type } from "../theme";
import { values } from "../content";

const Section = styled.section`
  ${sectionPad};
  display: flex;
  flex-direction: column;
  gap: 64px;
  padding-top: 112px;
  ${bp.sm} { padding-top: 180px; }
  h2 { ${type.headingXL}; color: ${color.ink}; }
`;
const Stack = styled.div`
  position: relative;
`;
const DotColumn = styled.div`
  position: absolute;
  left: 8px;
  top: 209px;
  z-index: 10;
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  ${bp.sm} { display: flex; }
`;
const DotButton = styled.button`
  display: block;
  width: ${({ $on }) => ($on ? "14px" : "10px")};
  height: ${({ $on }) => ($on ? "14px" : "10px")};
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: ${({ $bg, $on }) => ($on ? $bg : "#b5b5b0")};
  cursor: pointer;
  transition: width 0.2s, height 0.2s, background 0.2s;
`;
const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const cardBase = `
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
  border-radius: ${radius.lg};
  background: ${color.surface};
  text-align: left;
  font: inherit;
  border: 0;
  cursor: pointer;
  transition: min-height 0.3s ease, gap 0.3s ease, padding 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
`;
// Each card stays in its original position; the active one grows in place.
const Card = styled.button`
  ${cardBase};
  min-height: ${({ $active }) => ($active ? "168px" : "128px")};
  gap: ${({ $active }) => ($active ? "28px" : "20px")};
  padding: ${({ $active }) => ($active ? "24px" : "16px 24px")};
  box-shadow: ${({ $active }) => ($active ? "0 12px 32px rgba(0, 0, 0, 0.1)" : "0 4px 12px rgba(0, 0, 0, 0.05)")};
  transform: ${({ $active }) => ($active ? "scale(1.015)" : "scale(1)")};
  &:hover { background: ${({ $active }) => ($active ? color.surface : "#fafaf8")}; }
  ${bp.sm} {
    margin-left: 80px;
    margin-right: 32px;
    width: calc(100% - 112px);
    padding-left: 32px;
    padding-right: 40px;
  }
`;
const Accent = styled.span`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 6px;
  background: ${({ $bg }) => $bg};
`;
const IconCircle = styled.span`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: ${({ $big }) => ($big ? "80px" : "52px")};
  height: ${({ $big }) => ($big ? "80px" : "52px")};
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  img { display: block; max-width: none; }
`;
const Text = styled.span`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: ${({ $big }) => ($big ? "6px" : "2px")};
  .name {
    ${({ $big }) => ($big ? css`font-size: 28px; font-weight: 600; line-height: 1.2;` : type.labelL)};
    color: ${color.ink};
  }
  .body { ${type.bodyM}; color: ${color.inkSecondary}; }
`;

/**
 * Value cards stay fixed in place; clicking a card (or its dot) zooms that
 * one in without reordering or moving the others.
 */
export default function Values() {
  const [active, setActive] = useState(0);

  return (
    <Section aria-labelledby="values-title">
      <h2 id="values-title">Our values</h2>
      <Stack>
        <DotColumn>
          {values.map((v, i) => (
            <DotButton
              key={v.name}
              type="button"
              aria-label={`Show ${v.name}`}
              aria-pressed={i === active}
              $on={i === active}
              $bg={v.dotColor}
              onClick={() => setActive(i)}
            />
          ))}
        </DotColumn>

        <List>
          {values.map((v, i) => {
            const big = i === active;
            const [w, h] = big ? v.iconSize.active : v.iconSize.idle;
            return (
              <li key={v.name}>
                <Card type="button" $active={big} aria-pressed={big} onClick={() => setActive(i)}>
                  <Accent aria-hidden $bg={v.accent} />
                  <IconCircle aria-hidden $big={big} $bg={v.circle}>
                    <img src={v.icon} alt="" style={{ width: w, height: h }} />
                  </IconCircle>
                  <Text $big={big}>
                    <span className="name">{v.name}</span>
                    <span className="body">{v.body}</span>
                  </Text>
                </Card>
              </li>
            );
          })}
        </List>
      </Stack>
    </Section>
  );
}
