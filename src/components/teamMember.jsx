import React from "react";
import styled from "styled-components";

const TeamMemberContainer = styled.div`
    display: inline-block;
    background: #FFFFFF;
    box-shadow: 20px 20px 80px rgba(0, 0, 0, 0.1);
    border-radius: 24px;
    height: 360px;
    width: 300px;
    margin-bottom: 60px;
`

const TMName = styled.h2`
    text-align: center;
    font-size: 2.5em;
    margin-top: -50px;
    padding: 0px 5px;
    height: 2.5em;
    margin-bottom: -10px;
`

const TMPosition = styled.p`
    text-align: center;
    color: #656464;
    font-weight: bold;
`

const TMRole = styled.p`
    text-align: center;
    color: #656464;
`

const TMLinkedIn = styled.a`
    background: #D6F5FF;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 30px;
    padding: 5px 25px;
    text-decoration: none;
    transition: 0.3s;
    color: #656464;
    text-transform: uppercase;
    text-align: center;
    display: block;
    margin: 0 auto;
    width: 160px;
    cursor: pointer;
    
    &:hover {
        background: #aae0f1;
    }

`

const TMImage = styled.img`
    position: relative;
    top: -80px;
    display: block;
    margin: 0 auto;
    margin-bottom: -40px;
    width: 180px;
    height: auto;
`

const TeamMember = ({image, name, position, role, linkedIn}) => {

    return (
        <TeamMemberContainer>
            <TMImage src={image} />
            <TMName>{name}</TMName>
            <TMPosition>{position}</TMPosition>
            <TMRole>{role}</TMRole>
            <TMLinkedIn href={linkedIn} target="_blank">LinkedIn</TMLinkedIn>
        </TeamMemberContainer>
    )
}

export default TeamMember;