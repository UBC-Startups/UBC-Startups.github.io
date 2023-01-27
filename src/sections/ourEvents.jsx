import React from "react";
import styled from "styled-components";

const OurEventsContainer = styled.div`
    height: 100vh;
`

const OurEventsTitle = styled.h1`
    font-family: 'Abril Fatface';
    text-align: center;
    font-size: 3em;
`


const OurEvents = () => {
    return (
        <OurEventsContainer>
            <OurEventsTitle>Our Events</OurEventsTitle>


        </OurEventsContainer>
    )
}

export default OurEvents;