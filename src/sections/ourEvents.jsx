import React, { useState } from "react";
import styled from "styled-components";
import EventBox from "../components/event";
import SoarImage from "../images/eventPhotos/soarImage.png";
import himmi from "../images/eventPhotos/himmi.png";
import PrototypingWImage from "../images/eventPhotos/prototypingWorkshopImg.jpg";
import AboutImage1 from "../images/AboutImage1.jpg";

const OurEventsContainer = styled.div`
  margin: 5% 0px;
  overflow-x: hidden;
  position: relative;
  text-align: center;
    padding-bottom: 50px;

`;

const OurEventsTitle = styled.h1`
  font-family: "Roboto Slab";
  text-align: center;
  font-size: 3em;
`;

const Subtitle = styled.p`
  font-family: "Roboto Slab";
  color: #656464;
  font-size: 1.2em;
  margin-top: -10px;
  max-width: 800px;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); 
  gap: 50px;
  justify-items: center;
  margin-top: 50px;
  padding: 0 50px;
`;

const OurEvents = () => {
    // Only display this year's 4 events
    const events = [
        {
            img: himmi,
            title: "Kick Off and Welcome Event (2025W)",
            description:
                "UBC Startups is kicking off the year with a high-energy welcome event featuring an interactive investing game with industry professionals. Enjoy snacks, networking, and stories from past founders while getting a sneak peek at upcoming opportunities.",
            month: "Oct",
            day: "17",
            year: 2025,
            category: "upcoming",
        },
        {
            img: PrototypingWImage,
            title: "Innovation Olympics (2025W)",
            description:
                "Join us for Innovation Olympics, where UBC students, guided by mentors, transform failed startup ideas into bold new ventures. Compete for prizes and experience a night full of mentorship and high-energy innovation.",
            month: "Nov",
            day: "21",
            year: 2025,
            category: "upcoming",
        },
        {
            img: AboutImage1,
            title: "Found(Her)’s Brunch (2026W)",
            description:
                "Celebrate International Women’s Day with Found(Her)’s Brunch, featuring talks, Q&A, and networking with successful women founders and leaders. Connect, be inspired, and engage in conversations about entrepreneurship and empowerment.",
            month: "Mar",
            day: "8",
            year: 2026,
            category: "upcoming",
        },
        {
            img: SoarImage,
            title: "SOAR (2026W)",
            description:
                "SOAR is the university’s largest pitch competition with a $10,000 prize pool! Student founders pitch their ideas to investors and industry leaders, receive feedback, and compete for funding.",
            month: "Mar",
            day: "21",
            year: 2026,
            category: "upcoming",
        },
    ];

    return (
        <OurEventsContainer id="events">
            <OurEventsTitle>Our Upcoming Events</OurEventsTitle>
            <Subtitle>
                This year’s events are full of experiences including networking, case competitions, and much more!
            </Subtitle>

            <EventsGrid>
                {events.map((value, index) => (
                    <EventBox
                        key={index}
                        img={value.img}
                        title={value.title}
                        description={value.description}
                        month={value.month}
                        day={value.day}
                        category={value.category}
                    />
                ))}
            </EventsGrid>
        </OurEventsContainer>
    );
};

export default OurEvents;

