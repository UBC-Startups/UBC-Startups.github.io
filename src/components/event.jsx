import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import date from "../images/calendar.png";

const Card = styled.div`
    background: #fff;
    border-radius: 20px;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    text-align: left;
    width: 580px;
    max-width: 100%;
    transition: all 0.3s ease;

    @media (max-width: 768px) {
        width: 100%;
        margin: 0;
    }
`;

const DateContainer = styled.div`
    position: relative;
    width: 100%;
    padding-bottom: 8px;
`;

const Title = styled.p`
    margin: 0;
    font-weight: 500;
    font-family: Sansation, sans-serif;
    font-size: 1.2em;
    margin-bottom: 8px;
`;

const Description = styled.p`
    color: #656464;
    margin: 0;
    font-size: 0.8em;
`;

const DateTag = styled.div`
    display: inline-block;
    font-size: 1em;
    font-family: Sansation, sans-serif;
`;

const DateImg = styled.img`
    width: 16px;
    height: 16px;
    margin-right: 8px;
`;

const ImageContainer = styled.div`
    width: 100%;
    height: 260px;
    overflow: hidden;
    position: relative;

    &::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 45%;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.45) 100%);
        pointer-events: none;
    }
`;

const Img = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: ${(props) => props.$objectPosition || "center"};
`;

const PlaceholderImage = styled.div`
    width: 100%;
    height: 100%;
    background:
        linear-gradient(135deg, rgba(0, 0, 0, 0.85), rgba(51, 51, 51, 0.72)),
        radial-gradient(circle at 24% 26%, rgba(255, 255, 255, 0.18), transparent 28%),
        radial-gradient(circle at 78% 18%, rgba(255, 255, 255, 0.12), transparent 24%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-family: Sansation, sans-serif;
    font-size: 1.15em;
    letter-spacing: 0;
`;

const Content = styled.div`
    padding: clamp(10px, 2vw, 20px);
`;

const PosterButton = styled.button`
    background: #333333;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 10px 20px;
    font-size: 0.9em;
    cursor: pointer;
    margin-top: 15px;
    transition: all 0.3s;
    width: 100%;

    &:hover {
        background: #000000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
`;

const EventBox = ({ img, title, description, month, day, posterLink, imgPosition }) => {
    const navigate = useNavigate();

    const handlePosterClick = () => {
        if (posterLink) {
            navigate(posterLink);
        }
    };

    return (
        <Card>
            <ImageContainer>
                {img ? (
                    <Img src={img} alt={title} $objectPosition={imgPosition} />
                ) : (
                    <PlaceholderImage>Details Coming Soon</PlaceholderImage>
                )}
            </ImageContainer>
            <Content>
                <Title>{title}</Title>
                <DateContainer>
                    <DateImg src={date} alt="Date Icon" />
                    <DateTag>
                        {month} {day}
                    </DateTag>
                </DateContainer>
                <Description>{description}</Description>
                {posterLink && (
                    <PosterButton onClick={handlePosterClick}>
                        View Event Details & Sign Up
                    </PosterButton>
                )}
            </Content>
        </Card>
    );
};

export default EventBox;
