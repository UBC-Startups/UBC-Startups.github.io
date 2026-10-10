import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { bp, color, radius, sectionPad, type } from "../theme";
import { about } from "../content";
import { SectionLabel } from "../ui";

const Section = styled.section`
  ${sectionPad};
  padding-top: 80px;
  ${bp.sm} { padding-top: 100px; }
`;
const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  ${bp.lg} { flex-direction: row; align-items: center; gap: 64px; }
`;
const Copy = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  h2 { ${type.headingXL}; color: ${color.ink}; }
  p.body { ${type.bodyL}; font-weight: 500; color: ${color.ink}; }
`;
const Carousel = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 100%;
  max-width: 460px;
  height: 260px;
  overflow: hidden;
  border-radius: ${radius.xl};
  background: ${color.muted};
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 24px;
  box-sizing: border-box;
  ${bp.sm} { height: 360px; }
  ${bp.lg} { width: 460px; }
`;
const Slide = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${({ $on }) => ($on ? 1 : 0)};
  transition: opacity 0.5s;
`;
const Dots = styled.div`
  position: relative;
  display: flex;
  gap: 8px;
`;
const NavBtn = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  padding: 0;
  border-radius: ${radius.full};
  cursor: pointer;
  background: rgba(255, 255, 255, 0.85);
  color: ${color.charcoal};
  transition: background 0.2s, color 0.2s;
  svg { display: block; }
  ${({ $side }) => ($side === "left" ? "left: 12px;" : "right: 12px;")}
  ${bp.sm} {
    width: 40px;
    height: 40px;
  }
  &:hover, &:focus-visible {
    background: ${color.accent};
    color: ${color.inkInverse};
  }
`;
const DotBtn = styled.button`
  height: 8px;
  width: ${({ $on }) => ($on ? "24px" : "8px")};
  border: 0;
  padding: 0;
  border-radius: 999px;
  cursor: pointer;
  background: ${({ $on }) => ($on ? color.accent : "rgba(255,255,255,0.85)")};
  transition: width 0.2s;
`;

const Chevron = ({ dir }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ transform: dir === "left" ? "rotate(180deg)" : "none" }}
  >
    <path d="M6 3l5 5-5 5" />
  </svg>
);

function PhotoCarousel() {
  const [i, setI] = useState(0);
  const n = about.photos.length;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((x) => (x + 1) % n), 5000);
    return () => clearInterval(id);
  }, [n, i]);

  return (
    <Carousel>
      {about.photos.map((p, k) => (
        <Slide key={p.alt} src={p.src} alt={k === i ? p.alt : ""} $on={k === i} />
      ))}
      <NavBtn
        type="button"
        $side="left"
        aria-label="Previous photo"
        onClick={() => setI((x) => (x - 1 + n) % n)}
      >
        <Chevron dir="left" />
      </NavBtn>
      <NavBtn
        type="button"
        $side="right"
        aria-label="Next photo"
        onClick={() => setI((x) => (x + 1) % n)}
      >
        <Chevron dir="right" />
      </NavBtn>
      <Dots role="tablist" aria-label="Event photos">
        {about.photos.map((p, k) => (
          <DotBtn
            key={p.alt}
            type="button"
            role="tab"
            aria-selected={k === i}
            aria-label={`Show photo ${k + 1}: ${p.alt}`}
            $on={k === i}
            onClick={() => setI(k)}
          />
        ))}
      </Dots>
    </Carousel>
  );
}

export default function About() {
  return (
    <Section id="aboutUs" aria-labelledby="about-title">
      <Row>
        <Copy>
          <SectionLabel label={about.label} showIcon={false} />
          <h2 id="about-title">{about.title}</h2>
          <p className="body">{about.body}</p>
        </Copy>
        <PhotoCarousel />
      </Row>
    </Section>
  );
}
