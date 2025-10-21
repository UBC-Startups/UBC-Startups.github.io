import React from "react";
import styled from "styled-components";

const TeamMemberContainer = styled.div`
  display: inline-block;
  background: #FFFFFF;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  border-radius: 24px;
  height: 325px; 
  width: 300px;
  text-align: center;
  padding-top: 20px;
`;

const TMName = styled.h2`
    font-weight: 400;
    font-size: 2em;
    margin: 10px 0 10px 0;
`;

const TMPosition = styled.p`
  color: #656464;
  font-weight: bold;
  margin: 5px 0 0 0;
`;

const TMRole = styled.p`
  color: #656464;
  margin: 0 0 10px 0;
  font-size: 1.1rem;
`;

const TMLinkedIn = styled.a`
  background: #D6F5FF;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 30px;
  padding: 5px 25px;
  text-decoration: none;
  transition: 0.3s;
  color: #656464;
  text-transform: uppercase;
  display: inline-block;
  cursor: pointer;

  &:hover {
    background: #aae0f1;
  }
`;

const TMImageWrapper = styled.div`
  width: 200px;
  height: 190px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 50%; 
`;

const TMImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
`;

const TeamMember = ({ image, name, position, role, linkedIn }) => {
  return (
    <TeamMemberContainer>
      <TMImageWrapper>
        <TMImage src={image} />
      </TMImageWrapper>
      <TMName>{name}</TMName>
      {/* <TMPosition>{position}</TMPosition> */}
      <TMRole>{role}</TMRole>
      <TMLinkedIn href={linkedIn} target="_blank">
        LinkedIn
      </TMLinkedIn>
    </TeamMemberContainer>
  );
};

export default TeamMember;
