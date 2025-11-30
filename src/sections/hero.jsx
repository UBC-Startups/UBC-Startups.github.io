import React from "react";
import styled from "styled-components";
import { HashLink } from "react-router-hash-link";

import logo from "../images/Logo.svg"


const HeroContent = styled.div`
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

const NewsletterButton = styled(HashLink)`
    padding: 15px 40px;
    font-size: 1.1em;
    background: #000000;
    color: white;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    font-weight: 600;
    text-decoration: none;
    display: inline-block;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.3);
        background: #333333;
    }
`

const EventsButton = styled(HashLink)`
    padding: 15px 40px;
    font-size: 1.1em;
    background: white;
    color: #000000;
    border: 2px solid #000000;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    text-decoration: none;
    display: inline-block;
    
    &:hover {
        transform: translateY(-2px);
        background: #000000;
        color: white;
        box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.2);
    }
`


const Hero = ({heading, description}) => {
    return (
        <>
            <HeroContent>
                <HeroImage />
                <HeroTitle>{heading}</HeroTitle>
                <HeroDes>{description}</HeroDes>
                <ButtonContainer>
                    <NewsletterButton smooth to="/#subscription">Subscribe to Newsletter</NewsletterButton>
                    <EventsButton smooth to="/#events">Upcoming Events</EventsButton>
                </ButtonContainer>
            </HeroContent>
        </>
    )
}

export default Hero;