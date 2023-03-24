import React from "react";

import Head from "../components/head";
import NavigationBar from "../components/navigationBar";

import Hero from "../sections/hero";
import WhatWeOffer from "../sections/whatweoffer";
import OurEvents from "../sections/ourEvents";
import AboutUs from "../sections/aboutUs";
import MeetOurTeam from "../sections/meetOurTeam";
import Footer from "../sections/footer";

const HomePage = () => {
    return (
        <>
          <Head title="UBC Startups"/>
          <NavigationBar />
          <Hero 
            heading="UBC Startups"
            description="Building a startup ecosystem on campus"
          />
          <WhatWeOffer />
          <OurEvents />
          <AboutUs />
          <MeetOurTeam />
          {/* <Resources /> */}
          <Footer />
        </>
    )
}

export default HomePage;