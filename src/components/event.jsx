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

const EventBoxCoverImage = styled.img`
    position: relative;
    width: 100%;
    height: auto;
    // top: ${props => props.imgTop !== undefined ? `${props.imgTop}px` : "-100px"};
`

const EventBoxContentContainer = styled.div`
    position: relative;
    background: #FFFFFF;
    width: 100%;
    height: 120px;
    display: block;
    padding-top: 20px;
`
const DateContainer = styled.div`
    display: inline-block;
    float: left;
    position: relative;
    width: 80px;
    padding-left: 20px;
`

const Month = styled.p`
    background: #FF6868;
    width: 60px;
    text-align: center;
    margin: 0;
    padding: 5px;
    font-family: Sansation, sans-serif;
    font-weight: 400;
    font-size: 1em;
`

const Day = styled.p`
    background: rgba(253, 255, 255, 0.83);
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    width: 60px;
    text-align: center;
    margin: 0;
    padding: 10px 5px;
    font-family: Sansation, sans-serif;
    font-weight: 400;
    font-size: 1.5em;
`

const TextContainer = styled.div`
    display: inline-block;
    width: 480px;
    float: right;
    padding-right: 15px;
`

const Title = styled.p`
    margin: 0;
    font-weight: 500;
    font-family: Sansation, sans-serif;
    font-size: 1.2em;
    margin-bottom: 8px;
`

const Description = styled.p`
    color: #656464;
    margin: 0;
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
