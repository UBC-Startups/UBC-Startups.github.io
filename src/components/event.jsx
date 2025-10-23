import React from "react";
import styled from "styled-components";
import date from "../images/calendar.png";

const Card = styled.div`
    background: #fff;
    border-radius: 20px;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    text-align: left;
    width: 100%;

    @media (max-width: 768px) {
        width: 90%; 
        margin: 10px auto; 
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
`;

const Img = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const Content = styled.div`
    padding: clamp(10px, 2vw, 20px);
`;

const EventBox = ({ img, title, description, month, day }) => {
  return (
    <Card>
      <ImageContainer>
        <Img src={img} alt={title} />
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
      </Content>
    </Card>
  );
};

export default EventBox;
