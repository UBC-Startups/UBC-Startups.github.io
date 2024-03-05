import React from "react";
import styled from "styled-components";

const EventBoxContainer = styled.div`
    width: 600px;
    height: 270px;
    overflow: hidden;
    box-shadow: 20px 20px 80px rgba(0, 0, 0, 0.1);
    margin: 40px;
    border-radius: 30px;
    display: inline-block;
`

const EventCoverImageContainer = styled.div`
    width: 100%;
    height: 130px;
`

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
    font-family: 'Roboto Slab';
    font-weight: bold;
    font-size: 1em;
`

const Day = styled.p`
    background: rgba(253, 255, 255, 0.83);
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    width: 60px;
    text-align: center;
    margin: 0;
    padding: 10px 5px;
        
    font-family: 'Roboto Slab';
    font-weight: bold;
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
    font-family: 'Roboto Slab';
    font-weight: bold;
    font-size: 1.2em;
`

const Description = styled.p`
    color: #656464;
    margin: 0;
    font-family: 'Roboto Slab';
    font-size: 0.8em;
`

const EventBox = ({ img, title, description, month, day, category, imgTop="-100px" }) => {
    return (
        <EventBoxContainer>
            <EventCoverImageContainer>
                <EventBoxCoverImage src={img} style={{top:imgTop}}/>
            </EventCoverImageContainer>

            <EventBoxContentContainer>
                <DateContainer>
                    {/* Date */}
                    <Month>{month}</Month>
                    <Day>{day}</Day>
                </DateContainer>
               
                <TextContainer>
                    {/* Title */}
                    <Title>{title}</Title>
                    {/* Description */}
                    <Description>{description}</Description>
                </TextContainer>

            </EventBoxContentContainer>
        </EventBoxContainer>
    )
}

export default EventBox;