import React from "react";
import styled from "styled-components";
import Head from "../components/head";
import { bp, color, font } from "./theme";
import Nav from "./sections/Nav";
import NewsletterFooter from "./sections/NewsletterFooter";

const Page = styled.div`
  background: ${color.canvas};
  min-height: 100vh;
`;
const Frame = styled.div`
  box-sizing: border-box;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 16px 0;
  ${bp.sm} { padding: 0 28px 0; }
  ${bp.lg} { padding: 0 44px 0; }
  font-family: ${font};
  color: ${color.ink};
  -webkit-font-smoothing: antialiased;

  *, *::before, *::after { box-sizing: border-box; }
  p, h1, h2, h3 { margin: 0; }
  :focus-visible { outline: 2px solid ${color.accent}; outline-offset: 3px; }
`;

/** Shared shell for the redesigned pages: nav, page content, newsletter + footer. */
export default function Layout({ title = "UBC Startups", active, footerTitle, children }) {
  return (
    <Page>
      <Head title={title} />
      <Frame id="top">
        <Nav active={active} />
        <main>{children}</main>
        <NewsletterFooter title={footerTitle} />
      </Frame>
    </Page>
  );
}
