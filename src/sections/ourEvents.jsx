import React, { useState } from "react";
import styled from "styled-components";
import EventBox from "../components/event";

import AboutImage1 from "../images/AboutImage1.jpg";
import innovation  from "../images/eventPhotos/liftoff_activity.jpg"

const OurEventsContainer = styled.div`
    margin: 5% 0px;
    overflow-x: hidden;
    position: relative;
    text-align: center;
    padding-bottom: 50px;
`;

const OurEventsTitle = styled.h1`
    font-weight: 500;
    text-align: center;
    font-size: 3em;
    margin-bottom: 50px;
    font-family: 'Sansation', sans-serif;
`;

const Subtitle = styled.p`
    color: #656464;
    font-size: 1.2em;
    margin-top: -10px;
    max-width: 800px;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
`;

const EventsGrid = styled.div`
    margin: 0 auto;
    display: grid;
    grid-gap: 50px;
    justify-items: center;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    margin-top: 50px;
    padding: 0 25px;

    @media (max-width: 768px) {
        padding: 0;
    }
`;

const OurEvents = () => {
    // only display upcoming 2 events
    const events = [
        {
            img: innovation,
            title: "Innovation Olympics (2025W)",
            description:
                "Join us for Innovation Olympics, where UBC students, guided by professional mentors, transform failed startup ideas into bold new ventures. Pitch your ideas live, compete for prizes, and experience a night full of mentorship and high-energy innovation.",
            month: "Nov",
            day: "24",
            year: 2025,
            category: "upcoming",
            imgTop: "-100px",
            posterLink: "/event-poster/innovation-olympics-2025",
        },
        {
            img: AboutImage1,
            title: "Found(Her)'s Brunch  (2026W)",
            description:
                "Celebrate International Women's Day with Found(Her)'s Brunch, featuring talks, Q&A, and networking with successful women founders and leaders. Connect, be inspired, and engage in conversations about entrepreneurship and empowerment.",
            month: "March",
            day: "8",
            year: 2026,
            category: "upcoming",
            imgTop: "-100px",
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
                        posterLink={value.posterLink}
                    />
                ))}
            </EventsGrid>
        </OurEventsContainer>
    );
};

export default OurEvents;

