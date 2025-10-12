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

const HomePage = () => {
  return (
    <>
      <Head title="UBC Startups" />
      <NavigationBar />
      <Hero
        heading="UBC Startups"
        description="Building a startup ecosystem on campus"
      />
      {/* <NewEvent
        title="SOAR 2025"
        punchline="UBC Startups is proud to announce the 2025 SOAR Startup Pitch Competition!"
        description="Vancouver's startup ecosystem is thriving, and you should be a part of it too! Apply now to have a chance of winning $10,000 in non dilutive funding for your startup idea."
        extraDetails="Don't just hear about the future - see it unfold in real-time. Whether you're a founder, investor, or just love game-changing ideas, this is the event to be at!"
        registrationLink="https://forms.gle/GureEFUWAZsSRRaD7"
        date="April 6th, 2025"
      /> */}
      <WhatWeOffer />
      <OurEvents />
      <AboutUs />
      <OurValues />
      {/*<MeetOurTeam />*/}
      {/* <Resources /> */}
      <Footer />
    </>
  );
};

export default HomePage;
