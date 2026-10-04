import React, { useEffect } from "react";
import styled from "styled-components";
import { bp, color, figma, radius, type } from "../theme";
import { links } from "../content";
import { Glow } from "../ui";

const Footer = styled.footer`
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: 96px;
  overflow: hidden;
  border-radius: ${radius.xl};
  background: ${color.inverse};
  padding: 80px 24px 32px;
  ${bp.sm} { padding: 80px 40px 32px; }
  ${bp.lg} { min-height: 443px; box-sizing: border-box; gap: 155px; padding-top: 140px; }
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
  display: flex;
  flex-direction: column;
  gap: 32px;
  ${bp.lg} { flex-direction: row; align-items: flex-end; justify-content: space-between; }
  h2 { ${type.headingXL}; font-weight: 700; line-height: 0.82; letter-spacing: -0.01em; color: ${color.inkInverse}; }
`;
const Join = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  p { ${type.bodyM}; color: #fff; max-width: 387px; }
`;
const Bottom = styled.div`
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
  a { ${type.labelM}; color: ${color.inkInverse}; text-decoration: none; }
  a:hover { color: ${color.accent}; }
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

export default function NewsletterFooter() {
  // Same MailerLite embed the current Subscription section uses.
  useEffect(() => {
    window.ml = window.ml || function () { (window.ml.q = window.ml.q || []).push(arguments); };
    window.ml("account", "2125347");
    const script = document.createElement("script");
    script.src = "https://assets.mailerlite.com/js/universal.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

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
        <h2>Stay in the loop</h2>
        <Join>
          <p>Get the latest updates on events, workshops, and opportunities delivered straight to your inbox.</p>
          <div className="ml-embedded" data-form="OLHxhO"></div>
        </Join>
      </Main>

      <Bottom>
        <Brand href="#top">
          <img src={figma("logo-mark-inverse.svg")} alt="" />
          ubc startups
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
