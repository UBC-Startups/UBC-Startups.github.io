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
  background: none;
  cursor: pointer;
  transition: width 0.2s, height 0.2s;
  img { display: block; width: 100%; height: 100%; max-width: none; }
`;
const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
`;
const cardBase = `
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
  border-radius: ${radius.lg};
  background: ${color.surface};
  text-align: left;
`;
const ActiveCard = styled.div`
  ${cardBase};
  min-height: 168px;
  gap: 28px;
  padding: 24px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  ${bp.sm} { margin-left: 48px; padding: 24px 40px; }
`;
// Cards tuck under the one above: negative margin, matching top padding.
const IdleCard = styled.button`
  ${cardBase};
  font: inherit;
  border: 0;
  cursor: pointer;
  min-height: 128px;
  gap: 20px;
  margin: ${({ $first }) => ($first ? "-36px" : "-16px")} 12px 0;
  width: calc(100% - 24px);
  padding: ${({ $first }) => ($first ? "36px" : "16px")} 24px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  &:hover { background: #fafaf8; }
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
 * Stacked value cards. The active value sits on top as the large card; the others
 * tuck underneath. Clicking a card (or its dot) brings it to the front.
 */
export default function Values() {
  const [active, setActive] = useState(0);
  const order = [active, ...values.map((_, i) => i).filter((i) => i !== active)];

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
              onClick={() => setActive(i)}
            >
              <img src={v.dot} alt="" />
            </DotButton>
          ))}
        </DotColumn>

        <List>
          {order.map((vi, pos) => {
            const v = values[vi];
            const big = pos === 0;
            const [w, h] = big ? v.iconSize.active : v.iconSize.idle;
            const inner = (
              <>
                <Accent aria-hidden $bg={v.accent} />
                <IconCircle aria-hidden $big={big} $bg={v.circle}>
                  <img src={v.icon} alt="" style={{ width: w, height: h }} />
                </IconCircle>
                <Text $big={big}>
                  <span className="name">{v.name}</span>
                  <span className="body">{v.body}</span>
                </Text>
              </>
            );
            return (
              <li key={v.name} style={{ position: "relative", zIndex: values.length - pos }}>
                {big ? (
                  <ActiveCard>{inner}</ActiveCard>
                ) : (
                  <IdleCard type="button" $first={pos === 1} onClick={() => setActive(vi)}>
                    {inner}
                  </IdleCard>
                )}
              </li>
            );
          })}
        </List>
      </Stack>
    </Section>
  );
}
