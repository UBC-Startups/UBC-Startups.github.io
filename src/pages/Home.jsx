import React from "react";

import Head from "../components/head";
import NavigationBar from "../components/navigationBar";

import Hero from "../sections/hero";

const HomePage = () => {
    return (
        <>
        {/* CONVERT TO A MULTI PAGE WEBSITE LATER */}
          <Head title="UBC Startups"/>
          <NavigationBar />
          <Hero />
          {/* <Footer /> */}
        </>
    )
}

export default HomePage;