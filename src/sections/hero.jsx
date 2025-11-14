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
    z-index: -1;
    @media (max-width: 480px) {
        height: 100vh;
        width: 100%;
      }
`
const HeroImage = styled.div`
    background-image: url(${logo});
    width: 300px;
    height: 300px;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    margin: 0 auto;
    display: block;
    animation: float 3s ease-in-out infinite;
    filter: drop-shadow(0px 10px 30px rgba(0, 0, 0, 0.15));
    
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
`

const HeroTitle = styled.h1`
    text-align: center;
    font-size: 3em;
    margin-top: 0px;
    margin-bottom: -2.5px;
    background: linear-gradient(135deg, #000000ff 20%, #ffffffff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: fadeInUp 0.8s ease-out;
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`

const HeroDes = styled.p`
    text-align: center;
    font-size: 1.2em;
    color: #666;
    max-width: 600px;
    margin: 20px auto;
    line-height: 1.6;
    animation: fadeInUp 0.8s ease-out 0.2s backwards;
`

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin: 30px auto;
    flex-wrap: wrap;
`

const NewsletterButton = styled.button`
    padding: 15px 40px;
    font-size: 1.1em;
    background: #000000;
    color: white;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    font-weight: 600;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.3);
        background: #333333;
    }
`

const EventsButton = styled.button`
    padding: 15px 40px;
    font-size: 1.1em;
    background: white;
    color: #000000;
    border: 2px solid #000000;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    
    &:hover {
        transform: translateY(-2px);
        background: #000000;
        color: white;
        box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.2);
    }
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
                <ButtonContainer>
                    <NewsletterButton>Subscribe to Newsletter</NewsletterButton>
                    <EventsButton>View Events</EventsButton>
                </ButtonContainer>
                {/* <DotsContainer>
                    <Dots />
                    <Dots />
                </DotsContainer> */}
            </HeroContent>
        </>
    )
}

export default Hero;