import React from "react";
import styled from "styled-components";

// Matches the frame baked into the older portraits: a gradient ring ~4.3% of the
// diameter, then a black band ~3.2%, then the photo. Percent padding scales with size,
// so CSS-framed and baked-in photos line up at any avatar size.
const Ring = styled.div`
  width: 100%;
  height: 100%;
  padding: 4.3%;
  border-radius: 50%;
  background: conic-gradient(from 45deg, #ff9933, #87dabe, #e42e1c, #87dabe, #ff9933);
  & > div {
    width: 100%;
    height: 100%;
    padding: 3.4%;
    border-radius: 50%;
    background: #000;
  }
  & > div > div {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
  }
`;
const Img = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

/**
 * A team member's photo filling its (round) parent. Older portraits have the frame
 * baked in (cropped to the circle); newer ones get the same frame in CSS via
 * `photoFrame`. Crop settings come from
 * src/data/team.js (photoFrame, photoScale, photoPosition, photoOrigin).
 */
export default function TeamPhotoFill({ member: m, alt, loading = "lazy" }) {
  const img = (
    <Img
      className="photo"
      src={m.image}
      alt={alt === undefined ? m.name : alt}
      loading={loading}
      style={{
        objectPosition: m.photoPosition || "center",
        transform: `scale(${m.photoScale || 1})`,
        transformOrigin: m.photoOrigin || "center",
      }}
    />
  );
  return m.photoFrame ? <Ring><div><div>{img}</div></div></Ring> : img;
}
