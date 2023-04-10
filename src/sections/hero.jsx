import React from "react";
import styled from "styled-components";

import logo from "../images/Logo.svg"
import shapeDesign from "../images/HeroShapeDesign.svg"


const HeroContent = styled.div`;
    position: relative;
    margin: 0 auto;
    margin-top: 30vh;
    display: block;
    height: 90vh;
    @media (max-width: 480px) {
        margin-top: 300px;
        margin-bottom: -180px;
      }
`
const HeroShapes = styled.img`
    position: absolute;
    top: 0;
    width: 100%;
    @media (max-width: 480px) {
        height: 100vh;
        width: 100%;
      }
`
const HeroImage = styled.div`
    background-image: url(${logo});
    width: 100px;
    height: 100px;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    margin: 0 auto;
    display: block;
`

const HeroTitle = styled.h1`
    font-family: 'Abril Fatface';
    text-align: center;
    font-size: 3em;
    margin-top: 0px;
    margin-bottom: -2.5px;
`

const HeroDes = styled.p`
    text-align: center;
    font-family: 'Inter', sans-serif;
`

const DotsContainer = styled.div`
    display: block;
    margin: 0 auto;
    text-align: center;
`

const Dots = styled.div`
    display: inline-block;
    background: black;
    border: 4px white solid;
    border-radius: 50%;
    width: 10px;
    height: 10px;
    margin: 0 5px;
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
`

const Hero = ({heading, description}) => {
    return (
        <>
            <HeroShapes src={shapeDesign} />
            <HeroContent>
                <HeroImage />
                <HeroTitle>{heading}</HeroTitle>
                <HeroDes>{description}</HeroDes>
                {/* <DotsContainer>
                    <Dots />
                    <Dots />
                    <Dots />
                </DotsContainer> */}
            </HeroContent>
        </>
    )
}

export default Hero;