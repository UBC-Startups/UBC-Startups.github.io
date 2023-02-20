import React, { useState } from "react";
import styled, {keyframes} from "styled-components";

import EventBox from "../components/event";

// Images for events
import AboutImage2 from "../images/AboutImage2.jpg" // Placeholder

const OurEventsContainer = styled.div`
    margin: 5% 0px;
    overflow-x: hidden;
    position: relative;
`

const OurEventsTitle = styled.h1`
    font-family: 'Abril Fatface';
    text-align: center;
    font-size: 3em;
`

const FilterOptionsContainer = styled.ul`
    list-style-type: none;
    padding: 0;
`

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
    transition: 0.3s;
    &:hover {
        background: #faa1a1;
        color: #fff;
    }
`

// const breatheAnimation = keyframes`
//     0% { transform: translateX(0px); }
//     100% { transform: translateX(-750px); } 
// `
// - 250 * numberOfEvents

// const EventsContainer = styled.div`
//     width: 10000px;
//     display: inline-block;
//     animation-name: ${breatheAnimation};
//     animation-duration: 15s;
//     animation-iteration-count: infinite;
// `

const OurEvents = () => {
    const [category, setCategory] = useState("all");
    const events = [
        {
            img:AboutImage2,
            title:"How I Met Your Founder",
            description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. In fringilla dapibus velit, non condimentum sem tincidunt id.",
            month:"Sept",
            day:"26",
            category:"prev",
        },
        {
            img:AboutImage2,
            title:"How I Met My Intern",
            description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. In fringilla dapibus velit, non condimentum sem tincidunt id.",
            month:"Feb",
            day:"1",
            category:"upcoming",
        },
        {
            img:AboutImage2,
            title:"Networking Event",
            description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. In fringilla dapibus velit, non condimentum sem tincidunt id.",
            month:"Oct",
            day:"1",
            category:"prev",
        }
    ]
    let eventsToDisplay = 0;
    for (let i = 0; i < events.length; i++) {
        if (category === "all" || category === events[i]["category"]) {
            eventsToDisplay++;
        }
    }

    const breatheAnimation = keyframes`
        0% { transform: translateX(0px); }
        100% { transform: translateX(${-250 * eventsToDisplay}px); } 
    `
    const EventsContainer = styled.div`
        width: 10000px;
        display: inline-block;
        animation-name: ${breatheAnimation};
        animation-duration: ${5 * eventsToDisplay}s;
        animation-iteration-count: infinite;
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
                        />
                    )
                )}

      
            </EventsContainer>


        </OurEventsContainer>
    )
}

export default OurEvents;