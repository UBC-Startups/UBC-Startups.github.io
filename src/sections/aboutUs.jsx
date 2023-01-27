import React from "react";
import styled from "styled-components";

const AboutUsContainer = styled.div`
    box-shadow: 20px 20px 80px rgba(0, 0, 0, 0.1);
    width: 90vw;
    height: 80vh; // FOR NOW
    border-radius: 30px;
    display: block;
    margin: 0 auto;
`

const AUTitle = styled.h1`
    font-family: 'Abril Fatface';
    text-align: center;
    font-size: 3em;
`

const AUContent = styled.div`
    display: block;
    margin: 0 auto;
`

const AboutUs = () => {
    return (
        <AboutUsContainer>
            <AUTitle>About Us</AUTitle>
            <AUContent>

            </AUContent>
        </AboutUsContainer>
    )
}

export default AboutUs;