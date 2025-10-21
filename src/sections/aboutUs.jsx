import React from "react";
import styled from "styled-components";

import AboutImage1 from "../images/AboutImage1.jpg"
import AboutImage2 from "../images/AboutImage2.jpg"
import LiftOffImage from "../images/eventPhotos/liftoff.jpg"
import SoarImage from "../images/eventPhotos/soar2025.jpg"
const AboutUsContainer = styled.div`
    box-shadow: 20px 20px 80px rgba(0, 0, 0, 0.1);
    width: 80%;
    height: auto; 
    border-radius: 30px;
    display: block;
    margin: 0 auto;
    padding: 40px 40px;
    position: relative;
`

const AUTitle = styled.h1`
    font-weight: 500;
    text-align: center;
    font-size: 3em;
`

const AUContent = styled.div`
    display: block;
    margin: 0 auto;
    text-align: center;
    color: #656464;
`

const AboutImageContainer = styled.div`
    display: block;
    margin: 40px auto;
`

const AboutImage = styled.div`
    display: inline-block;
    width: 47.5%;
    height: 300px;
    background-size: cover;
    background-image: no-repeat;
    border-radius: 40px;
    position: relative;

    @media (max-width: 768px) {
        display: block;
        width: 100%;
        margin-bottom: 20px;
        float: none !important;
      }
`

const AboutUs = () => {
    return (
        <AboutUsContainer id="aboutUs">
            <AUTitle>About Us</AUTitle>
            <AUContent>
                UBC Startups is a platform dedicated to supporting and fostering entrepreneurship within the University of British Columbia community. Our mission is to provide students, alumni, and faculty with the resources, network, and support they need to turn their innovative ideas into successful ventures.
                <br/><br/>
                With a focus on interdisciplinary collaboration, we bring together individuals from diverse backgrounds to collaborate, learn, and grow as entrepreneurs. From hosting workshops and events to connecting members with mentors and investors, UBC Startups is committed to providing a comprehensive ecosystem for entrepreneurship at UBC.
                <br/><br/>
                Our team is comprised of passionate individuals who have a wealth of experience in entrepreneurship, innovation, and business. We are dedicated to creating a vibrant startup community at UBC and helping entrepreneurs take their ideas to the next level.
                <br/><br/>
                Join us today and become a part of a growing community of innovative thinkers and doers at UBC!
            </AUContent>

            <AboutImageContainer>
                <AboutImage style={{backgroundImage: `url(${LiftOffImage})`}}/>
                <AboutImage style={{backgroundImage: `url(${SoarImage})`, float:"right"}}/>
            </AboutImageContainer>
        </AboutUsContainer>
    )
}

export default AboutUs;