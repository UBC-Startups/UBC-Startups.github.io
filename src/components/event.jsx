import React from "react";
import styled from "styled-components";
import date from "../images/calendar.png";

const Card = styled.div`
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  text-align: left;
  max-width: 700px;
  width: 100%;
  transition: transform 0.3s ease;
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
  padding: 20px;
`;

const Title = styled.h2`
  font-family: "Roboto Slab";
  font-size: 1.4em;
  margin-top: 10px;
`;

const Description = styled.p`
    color: #656464;
    margin: 0;
    font-family: 'Roboto Slab';
    font-size: 0.8em;
`

const DateTag = styled.div`
  display: inline-block;
  font-weight: bold;
  font-size: 1em;
`;

const DateImg = styled.img`
    width: 16px;
    height: 16px;
    margin-right: 8px;
`;

const DateContainer = styled.div`
    margin: 10px 0;
    display: flex;
    align-items: center;
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
