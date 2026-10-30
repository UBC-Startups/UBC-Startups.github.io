import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { bp, color, radius, sectionPad, type } from "../theme";
import { links, socialFeed } from "../content";
import { SectionLabel } from "../ui";

/** Shared height for both native embeds so the two cards line up. */
const EMBED_HEIGHT = 460;

const Section = styled.section`
  ${sectionPad};
  padding-top: 80px;
  ${bp.sm} { padding-top: 100px; }
`;

const Head = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(10, 10, 10, 0.12);
  h2 { ${type.headingXL}; color: ${color.ink}; }
  p.body { ${type.bodyL}; color: ${color.inkSecondary}; }
`;
const TitleRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px 24px;
  flex-wrap: wrap;
`;
const PlatformLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  padding-bottom: 6px;
`;
const PlatformLink = styled.a`
  ${type.labelL};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${color.ink};
  text-decoration: none;
  transition: color 0.2s;
  &:hover { color: ${color.accent}; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 32px;
  ${bp.lg} { grid-template-columns: repeat(2, 1fr); }
`;
const Card = styled.article`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${color.surface};
  border: 1px solid rgba(10, 10, 10, 0.08);
  border-radius: ${radius.lg};
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.06);
`;
const CardHead = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(10, 10, 10, 0.08);
`;
const CardName = styled.p`
  ${type.labelM};
  color: ${color.ink};
`;
const CardBody = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
  /* Instagram replaces the blockquote with an iframe and sizes it itself;
     pin it to the shared embed height so both cards match. */
  iframe.instagram-media { height: ${EMBED_HEIGHT}px !important; }
`;
const EmbedSlot = styled.div`
  width: 100%;
`;
const FallbackBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: ${EMBED_HEIGHT}px;
  padding: 24px;
  text-align: center;
  border-radius: ${radius.md};
  background: ${color.canvas};
`;
const FallbackTitle = styled.p`
  ${type.bodyL};
  color: ${color.ink};
`;
const FallbackText = styled.p`
  ${type.bodyM};
  color: ${color.inkSecondary};
`;
const FallbackLink = styled.a`
  ${type.labelL};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  color: ${color.accent};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

/** LinkedIn's iframe embed needs an `urn:li:...` id; derive it from a post URL. */
function linkedInEmbedSrc(url) {
  if (!url) return null;
  const urn = url.match(/urn:li:[a-zA-Z]+:\d+/);
  if (urn) return `https://www.linkedin.com/embed/feed/update/${urn[0]}`;
  const activity = url.match(/activity[-:](\d+)/);
  if (activity) return `https://www.linkedin.com/embed/feed/update/urn:li:activity:${activity[1]}`;
  return null;
}

function LinkedInEmbed({ src }) {
  return (
    <iframe
      src={src}
      title="LinkedIn post"
      frameBorder="0"
      scrolling="auto"
      allowFullScreen
      style={{ display: "block", width: "100%", height: EMBED_HEIGHT, border: 0 }}
    />
  );
}

let igScript;
function processInstagram() {
  if (window.instgrm?.Embeds?.process) window.instgrm.Embeds.process();
}
function InstagramEmbed({ url }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!url) return;
    const root = ref.current;
    /* Instagram renders its embed with scrolling="no"; re-enable it so the card can
       be shorter than the embed's natural height without permanently hiding content. */
    const applyScroll = () => {
      root
        ?.querySelectorAll("iframe.instagram-media")
        .forEach((frame) => frame.setAttribute("scrolling", "auto"));
    };

    const observer = new MutationObserver(applyScroll);
    if (root) observer.observe(root, { childList: true, subtree: true });

    const onLoad = () => {
      processInstagram();
      applyScroll();
    };

    if (window.instgrm) {
      onLoad();
    } else if (!igScript) {
      igScript = document.createElement("script");
      igScript.async = true;
      igScript.src = "https://www.instagram.com/embed.js";
      igScript.addEventListener("load", onLoad);
      document.body.appendChild(igScript);
    } else {
      igScript.addEventListener("load", onLoad);
    }

    return () => observer.disconnect();
  }, [url]);

  if (!url) return null;
  return (
    <EmbedSlot ref={ref}>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={`${url}?utm_source=ig_embed&utm_campaign=loading`}
        data-instgrm-version="14"
        style={{
          background: "#FFF",
          border: 0,
          borderRadius: "3px",
          boxShadow: "0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)",
          margin: "1px",
          maxWidth: "100%",
          minWidth: "326px",
          padding: 0,
          width: "100%",
        }}
      >
        <a href={url} target="_blank" rel="noreferrer">View this post on Instagram</a>
      </blockquote>
    </EmbedSlot>
  );
}

const Arrow = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
  </svg>
);

function EmbedCard({ platform, icon, children }) {
  return (
    <Card>
      <CardHead>
        {icon}
        <CardName>{platform}</CardName>
      </CardHead>
      <CardBody>{children}</CardBody>
    </Card>
  );
}

/** Shown when a post URL is missing or can't be parsed into an embed. */
function Fallback({ platform, href }) {
  return (
    <FallbackBox>
      <FallbackTitle>Post unavailable</FallbackTitle>
      <FallbackText>We couldn't load this {platform} post right now.</FallbackText>
      <FallbackLink href={href} target="_blank" rel="noreferrer">
        View our {platform} <Arrow />
      </FallbackLink>
    </FallbackBox>
  );
}

export default function SocialFeed() {
  const { label, title, body, linkedin, instagram } = socialFeed;
  const linkedinSrc = linkedInEmbedSrc(linkedin);
  return (
    <Section aria-labelledby="social-feed-title">
      <Head>
        <SectionLabel label={label} />
        <TitleRow>
          <h2 id="social-feed-title">{title}</h2>
          <PlatformLinks>
            <PlatformLink href={links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn <Arrow />
            </PlatformLink>
            <PlatformLink href={links.instagram} target="_blank" rel="noreferrer">
              Instagram <Arrow />
            </PlatformLink>
          </PlatformLinks>
        </TitleRow>
        <p className="body">{body}</p>
      </Head>

      <Grid>
        <EmbedCard
          platform="LinkedIn"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <rect width="24" height="24" rx="4" fill="#0A66C2" />
              <path fill="#fff" d="M7.2 9.4h2.1v7.4H7.2zM8.25 5.6a1.22 1.22 0 1 1 0 2.44 1.22 1.22 0 0 1 0-2.44zM11 9.4h2v1.01h.03c.28-.53.96-1.09 1.98-1.09 2.12 0 2.51 1.4 2.51 3.21v4.27h-2.1v-3.78c0-.9-.02-2.06-1.26-2.06-1.26 0-1.45.98-1.45 1.99v3.85H11z" />
            </svg>
          }
        >
          {linkedinSrc ? (
            <LinkedInEmbed src={linkedinSrc} />
          ) : (
            <Fallback platform="LinkedIn" href={links.linkedin} />
          )}
        </EmbedCard>
        <EmbedCard
          platform="Instagram"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <defs>
                <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                  <stop offset="0%" stopColor="#fdf497" />
                  <stop offset="45%" stopColor="#fd5949" />
                  <stop offset="60%" stopColor="#d6249f" />
                  <stop offset="90%" stopColor="#285AEB" />
                </radialGradient>
              </defs>
              <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
              <rect x="5.6" y="5.6" width="12.8" height="12.8" rx="4" fill="none" stroke="#fff" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" strokeWidth="1.5" />
              <circle cx="16.1" cy="7.9" r="0.9" fill="#fff" />
            </svg>
          }
        >
          {instagram ? (
            <InstagramEmbed url={instagram} />
          ) : (
            <Fallback platform="Instagram" href={links.instagram} />
          )}
        </EmbedCard>
      </Grid>
    </Section>
  );
}
