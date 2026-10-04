import React from "react";
import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { color, figma, radius, type } from "./theme";

// Pill button. Primary on light surfaces; secondary and outline on dark surfaces.
const variants = {
  primary: css`
    background: ${color.inverse};
    color: ${color.inkInverse};
    border: 1px solid ${color.inverse};
    &:hover { background: ${color.inverseSubtle}; }
  `,
  secondary: css`
    background: ${color.surface};
    color: ${color.ink};
    border: 1px solid ${color.surface};
    &:hover { background: ${color.canvas}; }
  `,
  outline: css`
    background: transparent;
    color: ${color.inkInverse};
    border: 1px solid ${color.inkInverse};
    &:hover { background: rgba(255, 255, 255, 0.1); }
  `,
};

const buttonStyles = css`
  ${type.labelM};
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  padding: 11px 16px 11px 24px; /* 12px minus the 1px border */
  border-radius: ${radius.full};
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s;
  ${({ $variant }) => variants[$variant || "primary"]};
`;

const StyledLink = styled(Link)`${buttonStyles}`;
const StyledHash = styled(HashLink)`${buttonStyles}`;
const StyledButton = styled.button`${buttonStyles}`;

const Dot = styled.img`
  display: block;
  width: 7px;
  height: 7px;
`;

/** Pass `to` for a route, `hash` for a homepage section (e.g. "/#faq"), or neither for a <button>. */
export function Button({ variant = "primary", showDot = false, to, hash, children, ...rest }) {
  const content = (
    <>
      {children}
      {showDot && <Dot src={figma("button-dot.svg")} alt="" />}
    </>
  );
  if (hash) return <StyledHash smooth to={hash} $variant={variant} {...rest}>{content}</StyledHash>;
  if (to) return <StyledLink to={to} $variant={variant} {...rest}>{content}</StyledLink>;
  return <StyledButton type="button" $variant={variant} {...rest}>{content}</StyledButton>;
}

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
const LabelText = styled.p`
  ${type.labelM};
  color: ${color.ink};
`;
const PlusIcon = styled.span`
  position: relative;
  display: block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${color.inverse};
  &::before, &::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: ${color.surface};
    border-radius: 1px;
  }
  &::before { width: 8px; height: 1.6px; }
  &::after { width: 1.6px; height: 8px; }
`;

/** Eyebrow label that introduces a section. */
export function SectionLabel({ label, showIcon = true }) {
  return (
    <LabelRow>
      {showIcon && <PlusIcon aria-hidden />}
      <LabelText>{label}</LabelText>
    </LabelRow>
  );
}

/** Wrapper for decorative Figma glow vectors (blur overflow is baked into the inset). */
export const Glow = styled.div`
  position: absolute;
  pointer-events: none;
  & > div { position: absolute; inset: ${({ $inset }) => $inset}; }
  & img { display: block; width: 100%; height: 100%; max-width: none; }
`;
