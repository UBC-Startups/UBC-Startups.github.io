import React from "react";

import Head from "../components/head";
import NavigationBar from "../components/navigationBar";

import Hero from "../sections/hero";
import Footer from "../sections/footer";
import JobPostings from "../sections/jobPostings";

const OpportunitiesPage = () => {
    return (
        <>
          <Head title="Opportunities | UBC Startups"/>
          <NavigationBar />
          <Hero 
            heading="Internship Opportunities"
            description="Find internship opportunities from our partners!"
          />
          
          <JobPostings />

          <Footer />
        </>
    )
}

export default OpportunitiesPage;