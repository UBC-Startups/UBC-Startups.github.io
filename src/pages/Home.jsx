import React from "react";
import styled from "styled-components";

import Head from "../components/head";
import { color, font } from "../home/theme";
import Nav from "../home/sections/Nav";
import Hero from "../home/sections/Hero";
import Partners from "../home/sections/Partners";
import About from "../home/sections/About";
import Stats from "../home/sections/Stats";
import Offerings from "../home/sections/Offerings";
import Values from "../home/sections/Values";
import Team from "../home/sections/Team";
import Faq from "../home/sections/Faq";
import NewsletterFooter from "../home/sections/NewsletterFooter";

// Homepage redesign (Figma: "UBC Startups — Website Remix", HOMEPAGE frame).
// The previous homepage sections are still in src/sections/ and used by other pages.

const Page = styled.div`
  background: ${color.canvas};
  min-height: 100vh;
`;
const Frame = styled.div`
  box-sizing: border-box;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 12px 12px;
  font-family: ${font};
  color: ${color.ink};
  -webkit-font-smoothing: antialiased;

  *, *::before, *::after { box-sizing: border-box; }
  p, h1, h2, h3 { margin: 0; }
  :focus-visible { outline: 2px solid ${color.accent}; outline-offset: 3px; }
`;

const HomePage = () => (
  <Page>
    <Head title="UBC Startups" />
    <Frame id="top">
      <Nav />
      <main>
        <Hero />
        <Partners />
        <About />
        <Stats />
        <Offerings />
        <Values />
        <Team />
        <Faq />
      </main>
      <NewsletterFooter />
    </Frame>
  </Page>
);

export default HomePage;
