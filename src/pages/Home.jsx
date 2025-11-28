import React from "react";

import Head from "../components/head";
import NavigationBar from "../components/navigationBar";

import Hero from "../sections/hero";
import WhatWeOffer from "../sections/whatweoffer";
import OurEvents from "../sections/ourEvents";
import AboutUs from "../sections/aboutUs";
import OurValues from "../sections/ourValues";
//import MeetOurTeam from "../sections/meetOurTeam";
import Footer from "../sections/footer";
//import NewEvent from "../sections/newEvent";
import Partners from "../sections/ourPartners";
import FAQ from "../sections/faq";
import Stats from "../sections/stats";
import styled from "styled-components";
import shapeDesign from "../images/HeroShapeDesign.svg";

const BackgroundWrapper = styled.div`
    position: absolute;
    top: -200px;
    left: 0px;
    width: 100%;
    min-height: 100%;
    z-index: -1;
    pointer-events: none;

    background-image: url(${shapeDesign});
    background-repeat: repeat;
    background-position: top left;
    background-size: 100%;

    @media (max-width: 600px) {
        top: -300px;
        background-size: 100% 100vh;
        background-repeat: repeat;
    }
`;



const HomePage = () => {
    return (
        <div style={{ position: "relative", minHeight: "100%" }}>
            <BackgroundWrapper />
            <Head title="UBC Startups" />
            <NavigationBar />
            <Hero
                heading="UBC Startups"
                description="Building a startup ecosystem on campus"
            />
            <AboutUs />
            <Stats />
            <WhatWeOffer />
            <Partners />
            <OurEvents />
            <OurValues />
            <FAQ />
            <Footer />
        </div>
    );
};

export default HomePage;
