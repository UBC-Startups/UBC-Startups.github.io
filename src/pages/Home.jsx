import React from "react";

import Head from "../components/head";
import NavigationBar from "../components/navigationBar";

import Hero from "../sections/hero";
import WhatWeOffer from "../sections/whatweoffer";
import OurEvents from "../sections/ourEvents";
import AboutUs from "../sections/aboutUs";
import OurValues from "../sections/ourValues";
import MeetOurTeam from "../sections/meetOurTeam";
import Footer from "../sections/footer";
// import Soar from "../sections/soar";
import NewEvent from "../sections/newEvent";

const HomePage = () => {
  return (
    <>
      <Head title="UBC Startups" />
      <NavigationBar />
      <Hero
        heading="UBC Startups"
        description="Building a startup ecosystem on campus"
      />
      <NewEvent
        title="IDCreate 2024"
        punchline="IDCreate will be our 2nd event of the year, where future entrepreneurs have the opportunity to network and connect with entrepreneurs from and outside of UBC."
        description="We aim to have a diverse panel with entrepreneurs from various faculities. Students will have time to ask panelists questions, followed by a group activity to ideate a product and pitch it to the panel. At the end, we will open up the floor for an open networking session!"
        extraDetails="This event is designed in such a way that students need not have a business background to attend, they all must have one thing in common; the love for entrepreneurship!"
        registrationLink="https://forms.gle/vBmDxY64dyYPuPxz7"
        date="November 4th, 2024 (5:30pm to 8:30pm)"
      />
      <WhatWeOffer />
      <OurEvents />
      <AboutUs />
      <OurValues />
      <MeetOurTeam />
      {/* <Resources /> */}
      <Footer />
    </>
  );
};

export default HomePage;
