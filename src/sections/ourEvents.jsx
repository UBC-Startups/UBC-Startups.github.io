import React, { useState } from "react";
import styled from "styled-components";
import EventBox from "../components/event";

import SoarImage  from "../images/eventPhotos/soarImage.png"
import startupGames from "../images/eventPhotos/startup_games.jpg"

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
    max-width: 1400px;
    display: grid;
    grid-gap: 50px;
    justify-items: center;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    margin-top: 50px;
    padding: 0 25px;

    @media (max-width: 768px) {
        padding: 0;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }
`;

const OurEvents = () => {
    // only display upcoming 2 events
    const events = [
        {
            img: startupGames,
            title: "Startup Games (2026W)",
            description:
                "The Startup Games is a high-stakes, Squid Game–inspired competition where 30 founders face four startup challenges testing their pitch, adaptability, teamwork, and strategy. Guided by masked VIP judges and watched by “guards,” players are eliminated each round until one founder remains - crowned the UBC Startup Champion and winning mentorship and $500, as well as a guaranteed spot at SOAR.",
            month: "Feb",
            day: "4",
            year: 2026,
            category: "upcoming",
            imgTop: "-100px",
        },
        {
            img: SoarImage,
            title: "SOAR (2026W)",
            description:
                "SOAR is the university's largest pitch competition with a $10,000 prize pool! Student founders pitch their ideas to investors and industry leaders, receive feedback, and compete for funding. With networking, lunch, and a full day of presentations, SOAR is the perfect way to be inspired and support the next wave of UBC entrepreneurs.",
            month: "March",
            day: "21",
            year: 2026,
            category: "upcoming",
            imgTop: "-20px",
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

