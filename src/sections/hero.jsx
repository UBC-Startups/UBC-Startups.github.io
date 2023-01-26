import React from "react";
import styled from "styled-components";

import logo from "../images/Logo.svg"
import shapeDesign from "../images/HeroShapeDesign.svg"


const HeroContent = styled.div`;
    position: relative;
    margin: 0 auto;
    margin-top: 160px;
    display: block;
`

const HeroImage = styled.div`
    background-image: url(${logo});
    width: 80px;
    height: 80px;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    margin: 0 auto;
    display: block;
`

const HeroTitle = styled.h1`
    font-family: 'Abril Fatface';
    text-align: center;
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

const Hero = () => {
    const shapeDesignStyles = {
        position: "absolute",
        top: "0",
      };

    return (
        <>
            <img style={shapeDesignStyles} src={shapeDesign} />
            <HeroContent>
                <HeroImage />
                <HeroTitle>UBC Startups</HeroTitle>
                <HeroDes>Building a startup ecosystem on campus</HeroDes>
                <DotsContainer>
                    <Dots />
                    <Dots />
                    <Dots />
                </DotsContainer>
            </HeroContent>
        </>
    )
}

export default Hero;