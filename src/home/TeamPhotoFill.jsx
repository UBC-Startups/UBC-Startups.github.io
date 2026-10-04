import React from "react";
import styled from "styled-components";

// Same ring as the frames baked into the older portraits, so every photo matches.
const Ring = styled.div`
  width: 100%;
  height: 100%;
  padding: 5%;
  border-radius: 50%;
  background: conic-gradient(from 45deg, #ff9933, #87dabe, #e42e1c, #87dabe, #ff9933);
  & > div { width: 100%; height: 100%; border: 3px solid #000; border-radius: 50%; overflow: hidden; }
`;
const Img = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

/**
 * A team member's photo filling its (round) parent, using the crop settings from
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
  return m.photoFrame ? <Ring><div>{img}</div></Ring> : img;
}
