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
  height: 320px;
  overflow: hidden;
  border-radius: ${radius.xl};
  background: ${color.muted};
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 24px;
  box-sizing: border-box;
  ${bp.sm} { height: 480px; }
  ${bp.lg} { width: 620px; }
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
