import React from "react";
import styled from "styled-components";

const AboutUsContainer = styled.div`
    height: 100vh;
`

const AUTitle = styled.h1`
    font-family: 'Abril Fatface';
    text-align: center;
    font-size: 3em;
`

const AboutUs = () => {
    return (
        <AboutUsContainer>
            <AUTitle>About Us</AUTitle>
        </AboutUsContainer>
    )
}

export default AboutUs;