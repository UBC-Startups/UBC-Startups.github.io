import React from "react";

import Head from "../components/head";
import NavigationBar from "../components/navigationBar";

import Hero from "../sections/hero";
import WhatWeOffer from "../sections/whatweoffer";
import OurEvents from "../sections/ourEvents";
import AboutUs from "../sections/aboutUs";
import MeetOurTeam from "../sections/meetOurTeam";


const HomePage = () => {
    return (
        <>
        {/* CONVERT TO A MULTI PAGE WEBSITE LATER */}
          <Head title="UBC Startups"/>
          <NavigationBar />
          <Hero />
          <WhatWeOffer />
          <OurEvents />
          <AboutUs />
          <MeetOurTeam />

          {/* <Footer /> */}
        </>
    )
}

export default HomePage;