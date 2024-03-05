import React, { useState } from "react";
import styled, {keyframes} from "styled-components";

import EventBox from "../components/event";

// Images for events
import AboutImage2 from "../images/AboutImage2.jpg" // Placeholder
import TwentyFiveBrunchImg from "../images/25under25.jpg"
import FSAISAAS from "../images/founderSpotlightAISaaS.png"
import HIMMIImage from "../images/himmi.png"
import GtwImage from "../images/gainingTractionImg.jpg"
import PrototypingWImage from "../images/prototypingWorkshopImg.jpg"
import PitchWImage from "../images/pitchWorkshopImg.png"
import SoarImage from "../images/soarImage.png"


const OurEventsContainer = styled.div`
    margin: 5% 0px;
    overflow-x: hidden;
    position: relative;
`

const OurEventsTitle = styled.h1`
    font-family: 'Roboto Slab';
    text-align: center;
    font-size: 3em;
`

const FilterOptionsContainer = styled.ul`
    list-style-type: none;
    padding: 0;
`


const OurEvents = () => {
    const [category, setCategory] = useState("all");
    const events = [
        {
            img: SoarImage,
            title: "Soar",
            description: "UBC Startups in partnership with the CSSS are thrilled to announce the first iteration of the Soar Startup Pitch Competition, a premier event designed to showcase the entrepreneurial talent and innovative ideas within the UBC community. There will be a $10,000 non-dilutive cash prize!",
            month: "Mar",
            day: "23",
            category: "upcoming",
            imgTop: "-20px"
        },
        {
            img: PitchWImage,
            title: "Workshop 3: Pitch Perfect",
            description: "Pitch perfect, organized by UBC Startups in collaboration with the CSSS will prepare students for Soar. It's part of a series aimed at equipping student founders with essential skills for success in the startup landscape, focusing on pitching products effectively",
            month: "Mar",
            day: "11",
            category: "upcoming",
        },
        {
            img: GtwImage,
            title: "Workshop 2: Gaining Traction",
            description: "A workshop hosted in collaboration with the CSSS, targets students preparing for Soar. As part of a series of workshops, it aims to equip future student founders with skills crucial for success in the startup scene, focusing on gaining traction for their products through insights and interactive learning opportunities.",
            month: "Feb",
            day: "8",
            category: "prev",
            imgTop: "-120px"
        },
        {
            img: PrototypingWImage,
            title: "Workshop 1: Prototyping & Product Design",
            description: "This workshop provided insights and interactive learning opportunities from both a designer's and a developer's perspective, designed to cultivate a deep understanding of product design and prototyping – skills essential for success in the competitive startup landscape.",
            month: "Jan",
            day: "24",
            category: "prev",
        },
        {
            img: FSAISAAS,
            title: "Founder Spotlight: AI/SaaS",
            description: "A networking event in partnership with the Computer Science Student Society (CSSS). Provided students with a chance to connect with AI and SaaS industry leaders, fostering a sense of community among budding entrepreneurs.",
            month: "Sept",
            day: "19",
            category: "prev",
        },
        {
            img: HIMMIImage,
            title: "How I met my Intern",
            description: "An event that aims to provide opportunities for entrepreneurial students at UBC to meet Vancouver-based startups that are hiring for internships. Startups that attend this event will be hiring interns exclusively from UBC, so this is an invaluable opportunity for students to make lasting impressions on hiring managers.",
            month: "Mar",
            day: "24",
            category: "prev",
        },
        {
            img: TwentyFiveBrunchImg,
            title: "25 Under 25 Brunch",
            description: "A brunch hosted by UBC Startups, Dyne, and eHub where successful entrepreneurs were invited to network with one another. Students at the event also got the opportunity to network with existing entrepreneurs and to gain insight from them, and one another.",
            month: "Nov",
            day: "26",
            category: "prev",
        },
        {
            img: AboutImage2,
            title: "How I Met Your Founder",
            description: "‘How I Met Your Founder’, sponsored by Contrary Capital, was an opportunity for students from different faculties to get advice from experienced entrepreneurs, and develop a sense of camaraderie as aspiring entrepreneurs.",
            month: "Sept",
            day: "26",
            category: "prev",
        },
    ];
    
    let eventsToDisplay = 0;
    for (let i = 0; i < events.length; i++) {
        if (category === "all" || category === events[i]["category"]) {
            eventsToDisplay++;
        }
    }
    const FilterOption = styled.li`
        text-transform: uppercase;
        color: #656464;
        padding: 10px 5px;
        width: 200px;
        text-align: center;
        background: #FFDCDC;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        border-radius: 30px;
        display: inline-block;
        margin: 0px 20px;
        cursor: pointer;
        z-index: 2;
        transition: 0.4s;
        @media (max-width: 800px) {
            display: block;
            margin: 12.5px auto;
        }
        &:nth-child(1) {
            background: ${() => category==="all" ? '#faa1a1' : '#FFDCDC'};
            color: ${() => category==="all" ? '#fff' : '#656464'};
        }
        &:nth-child(2) {
            background: ${() => category==="upcoming" ? '#faa1a1' : '#FFDCDC'};
            color: ${() => category==="upcoming" ? '#fff' : '#656464'};
        }
        &:nth-child(3) {
            background: ${() => category==="prev" ? '#faa1a1' : '#FFDCDC'};
            color: ${() => category==="prev" ? '#fff' : '#656464'};
        }
        &:hover {
            background: #faa1a1;
            color: #fff;
        }
    `
    const moveEventsAni = keyframes`
        0% { transform: translateX(0px); }
        100% { transform: translateX(${-250 * eventsToDisplay}px); } 
    `
    const moveEventsMobileAni = keyframes`
        0% { transform: translateX(0px); }
        100% { transform: translateX(${-600 * eventsToDisplay}px); } 
    `
    const EventsContainer = styled.div`
        width: 10000px;
        display: inline-block;
        animation-name: ${moveEventsAni};
        animation-duration: ${8 * eventsToDisplay}s;
        animation-iteration-count: infinite;

        @media (max-width: 768px) {
            animation-name: ${moveEventsMobileAni};
            animation-duration: ${9 * eventsToDisplay}s;
        }
    `
    return (
        <OurEventsContainer id="events">
            <OurEventsTitle>Our Events</OurEventsTitle>

            <FilterOptionsContainer>
                <FilterOption onClick={() => setCategory("all")}>All Events</FilterOption>
                <FilterOption onClick={() => setCategory("upcoming")}>Upcoming Events</FilterOption>
                <FilterOption onClick={() => setCategory("prev")}>Previous Events</FilterOption>
            </FilterOptionsContainer>
            
            {/* Make a for loop for each event */}
            <EventsContainer>
                {events.map((value, index) => 
                    (category === value["category"] || category === "all") && (
                        <EventBox
                            img={value["img"]}
                            title={value["title"]}
                            description={value["description"]}
                            month={value["month"]}
                            day={value["day"]}
                            category={value["category"]}
                            imgTop={value["imgTop"]}
                        />
                    )
                )}

      
            </EventsContainer>


        </OurEventsContainer>
    )
}

export default OurEvents;