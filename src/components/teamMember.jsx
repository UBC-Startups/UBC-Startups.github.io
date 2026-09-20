import React from "react";
import styled from "styled-components";
import defaultImg from "../images/Logo.svg";

const TeamMemberContainer = styled.div`
    display: inline-block;
    background: #FFFFFF;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
    border-radius: 24px;
    min-height: 345px;
    box-sizing: border-box;
    width: 300px;
    max-width: 100%;
    text-align: center;
    padding: 20px 12px;
`;

const TMName = styled.h2`
    font-weight: 400;
    font-size: 2em;
    margin: 10px 0 10px 0;
`;

const TMRole = styled.p`
    color: #656464;
    margin: 0 0 10px 0;
    font-size: 1.1rem;
`;

const TMLinkedIn = styled.a`
    background: #000000;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 30px;
    border: 0;
    font: inherit;
    padding: 5px 25px;
    text-decoration: none;
    transition: 0.3s;
    color: white;
    text-transform: uppercase;
    display: inline-block;
    cursor: pointer;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.3);
        background: #333333;
    }

    &:disabled {
        background: #000000;
        color: white;
        opacity: 1;
        cursor: not-allowed;
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

// Match the frame baked into the older portraits, within the same image slot.
const TMPhotoFrame = styled.div`
    width: 184px;
    height: 184px;
    margin: 0 auto;
    padding: 8px;
    box-sizing: border-box;
    border-radius: 50%;
    background: conic-gradient(from 45deg, #ff9933, #87dabe, #e42e1c, #87dabe, #ff9933);
`;

const TMPhotoCrop = styled.div`
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border: 5px solid #000;
    border-radius: 50%;
    overflow: hidden;
`;

const TeamMember = ({ image, name, role, linkedIn, photoFrame = false, photoScale = 1, photoPosition = "center", photoOrigin = "center" }) => {
  return (
    <TeamMemberContainer>
      <TMImageWrapper>
        {image && photoFrame ? (
          <TMPhotoFrame>
            <TMPhotoCrop>
              <TMImage
                src={image}
                alt={name}
                loading="lazy"
                style={{ objectPosition: photoPosition, transform: `scale(${photoScale})`, transformOrigin: photoOrigin }}
              />
            </TMPhotoCrop>
          </TMPhotoFrame>
        ) : (
          <TMImage src={image || defaultImg} alt={image ? name : "UBC Startups logo"} loading="lazy" />
        )}
      </TMImageWrapper>
      <TMName>{name}</TMName>
      <TMRole>{role}</TMRole>
      {linkedIn ? (
        <TMLinkedIn href={linkedIn} target="_blank" rel="noopener noreferrer" aria-label={`${name} on LinkedIn`}>
          LinkedIn
        </TMLinkedIn>
      ) : (
        <TMLinkedIn as="button" type="button" disabled aria-label={`${name}: LinkedIn link not yet available`}>
          LinkedIn
        </TMLinkedIn>
      )}
    </TeamMemberContainer>
  );
};

export default TeamMember;
