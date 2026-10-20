import React from "react";

import Layout from "../home/Layout";
import Hero from "../home/sections/Hero";
import SocialFeed from "../home/sections/SocialFeed";
import Partners from "../home/sections/Partners";
import About from "../home/sections/About";
import Stats from "../home/sections/Stats";
import Offerings from "../home/sections/Offerings";
import Values from "../home/sections/Values";
import Team from "../home/sections/Team";
import Faq from "../home/sections/Faq";

// Homepage redesign (Figma: "UBC Startups — Website Remix", HOMEPAGE frame).

const HomePage = () => (
  <Layout title="UBC Startups">
    <Hero />
    <SocialFeed />
    <Partners />
    <About />
    <Stats />
    <Offerings />
    <Values />
    <Team />
    <Faq />
  </Layout>
);

export default HomePage;
