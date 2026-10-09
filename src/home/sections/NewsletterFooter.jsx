import React, { useState } from "react";
import styled from "styled-components";
import { bp, color, figma, radius, type } from "../theme";
import { links } from "../content";
import { Button, Glow } from "../ui";

// Same inset, rounded-corner treatment as PageHero (the dark hero on the
// Events/Team pages), so the two black sections bookending a page match.
const Footer = styled.footer`
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: 96px;
  overflow: hidden;
  border-radius: ${radius.xl};
  background: ${color.inverse};
  padding: 40px 24px;
  margin-top: 80px;
  ${bp.sm} { padding: 48px 48px 56px; }
  ${bp.lg} { min-height: 443px; padding-top: 140px; }
`;
const Glows = styled.div`
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
`;
const OrangeGlow = styled.div`
  position: absolute;
  left: -210px;
  top: 50px;
  width: 980px;
  height: 700px;
  background: radial-gradient(490px 350px at 50% 50%, rgba(255, 90, 31, 0.42) 0%, rgba(255, 90, 31, 0.14) 45%, rgba(255, 90, 31, 0) 100%);
`;
const Main = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
  ${bp.lg} { flex-direction: row; align-items: center; justify-content: space-between; }
  h2 { ${type.headingXL}; font-weight: 700; line-height: 0.82; letter-spacing: -0.01em; color: ${color.inkInverse}; }
`;
const Join = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  ${bp.lg} { max-width: 420px; }
  p { ${type.bodyM}; color: #fff; max-width: 387px; }
`;
const Form = styled.form`
  display: flex;
  gap: 12px;
  align-items: center;
`;
const EmailInput = styled.input`
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  padding: 14px 24px;
  border-radius: ${radius.full};
  border: 1px solid #fff;
  background: transparent;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  outline: none;

  &::placeholder {
    color: ${color.inkInverseMuted};
  }
`;
const StatusText = styled.p`
  ${type.bodyM};
  margin: 0;
  color: #fff;
`;
const Bottom = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  ${bp.md} { flex-direction: row; align-items: center; justify-content: space-between; }
`;
const Brand = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  ${type.labelL};
  color: ${color.inkInverse};
  img { display: block; width: 28px; height: 28px; }
`;
const Social = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 40px;
  a {
    display: inline-block;
    ${type.labelM};
    color: ${color.inkInverse};
    text-decoration: none;
    transition: color 0.2s, transform 0.2s;
  }
  a:hover { color: ${color.accent}; transform: scale(1.12); }
`;
const Copyright = styled.p`
  ${type.labelS};
  color: ${color.inkInverseMuted};
`;

const footerLinks = [
  { label: "Instagram", href: links.instagram },
  { label: "LinkedIn", href: links.linkedin },
  { label: "Discord", href: links.discord },
  { label: "Email", href: links.email },
];

// Posts straight to the same MailerLite endpoint their own embed widget
// uses (account 2125347, form OLHxhO) via a hidden iframe target, so it
// works as a normal signup without a cross-origin fetch/CORS, and without
// depending on MailerLite's embed script re-scanning the DOM after this
// component remounts (which it doesn't reliably do when the user navigates
// between pages in this single-page app).
const ML_ACTION = "https://assets.mailerlite.com/jsonp/2125347/forms/180438509070321370/subscribe";
const ML_IFRAME_NAME = "ml-newsletter-target";

export default function NewsletterFooter({ title = "Stay in the loop." }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitted

  const handleSubmit = () => {
    if (!email) return;
    setStatus("submitted");
  };

  return (
    <Footer id="subscription">
      <Glows aria-hidden>
        <Glow $inset="-31.75%" style={{ left: -65, top: 105, width: 630, height: 630 }}>
          <div><img src={figma("footer-glow-left.svg")} alt="" /></div>
        </Glow>
        <Glow $inset="-28.57%" style={{ right: -294, top: -290, width: 700, height: 700 }}>
          <div><img src={figma("footer-glow-right.svg")} alt="" /></div>
        </Glow>
        <OrangeGlow />
      </Glows>

      <Main>
        <h2>{title}</h2>
        <Join>
          <p>Get the latest updates on events, workshops, and opportunities delivered straight to your inbox.</p>
          {status === "submitted" ? (
            <StatusText>Thanks — you're on the list!</StatusText>
          ) : (
            <Form action={ML_ACTION} method="post" target={ML_IFRAME_NAME} onSubmit={handleSubmit}>
              <EmailInput
                type="email"
                name="fields[email]"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input type="hidden" name="ml-submit" value="1" />
              <input type="hidden" name="anticsrf" value="true" />
              <Button type="submit" variant="secondary">Subscribe</Button>
            </Form>
          )}
        </Join>
      </Main>
      <iframe name={ML_IFRAME_NAME} title="Newsletter signup" style={{ display: "none" }} />

      <Bottom>
        <Brand href="/">
          <img src={figma("logo-mark-inverse.svg")} alt="" />
          UBC Startups
        </Brand>
        <Social>
          {footerLinks.map((l) => (
            <li key={l.label}>
              <a href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
            </li>
          ))}
        </Social>
        <Copyright>© {new Date().getFullYear()} UBC Startups. All rights reserved.</Copyright>
      </Bottom>
    </Footer>
  );
}
