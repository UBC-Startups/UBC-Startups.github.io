import React from "react";
import styled from "styled-components";
import PhotoGallery from "../components/photoGallery";

import LiftOffImage from "../images/eventPhotos/liftoff.jpg";
import SoarImage from "../images/eventPhotos/soar2025.jpg";
import BatterUpImage from "../images/eventPhotos/batterup_team.JPG";
import LiftoffAbout from "../images/eventPhotos/liftoff_about1.jpg";
import LiftoffEvent from "../images/eventPhotos/liftoff_events.jpg";
import LiftoffActivity from "../images/eventPhotos/liftoff_activity.jpg";

const AboutUsContainer = styled.div`
  box-shadow: 20px 20px 80px rgba(0, 0, 0, 0.1);
  width: 80%;
  height: auto; 
  border-radius: 30px;
  display: block;
  margin: 0 auto;
  padding: 40px;
  position: relative;
`;

const AUTitle = styled.h1`
  font-weight: 500;
  text-align: left;
  font-size: 3em;
  font-family: 'Sansation', sans-serif;
`;

const AboutContentWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  margin-top: 20px;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const AUContent = styled.div`
  flex: 1 1 45%;
  min-width: 300px;
  text-align: left;
  color: #656464;
  margin-bottom: 40px;
`;

const GalleryWrapper = styled.div`
  flex: 1 1 50%;
  min-width: 300px;
`;

const images = [
  { original: LiftOffImage },
  { original: SoarImage },
  { original: BatterUpImage },
  { original: LiftoffAbout },
  { original: LiftoffEvent },
  { original: LiftoffActivity }
];

const AboutUs = () => {
  return (
    <AboutUsContainer id="aboutUs">
      <AUTitle>About Us</AUTitle>
      <AboutContentWrapper>
        <AUContent>
          UBC Startups is a platform dedicated to supporting and fostering entrepreneurship within the UBC community!
          <br /><br />
          Our mission is to equip students, alumni, and faculty with the resources, network, and support needed to turn innovative ideas into
          successful ventures. With a strong focus on interdisciplinary collaboration, we bring together individuals from diverse backgrounds to learn,
          connect, and grow as entrepreneurs. Through workshops, events, and mentorship opportunities, UBC Startups provides a comprehensive ecosystem
          that empowers UBC’s entrepreneurial community to take their ideas to the next level.
          <br /><br />
          Join us and become a part of a growing community of innovative thinkers and doers at UBC!
        </AUContent>
        <GalleryWrapper>
          <PhotoGallery images={images} />
        </GalleryWrapper>
      </AboutContentWrapper>
    </AboutUsContainer>
  );
};

export default AboutUs;
