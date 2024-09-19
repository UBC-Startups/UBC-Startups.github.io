import React from "react";
import styled from "styled-components";

const FoundersSpotlightContainer = styled.div`
  box-shadow: 20px 20px 80px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 800px;
  border-radius: 30px;
  margin: 40px auto;
  padding: 40px;
  text-align: center; /* Align all content to center */
`;

const FoundersSpotlightTitle = styled.h1`
  font-family: "Roboto Slab";
  font-size: 3em;
  margin-bottom: 20px;
`;

const FoundersSpotlightDescription = styled.p`
  font-family: "Roboto Slab";
  color: #656464;
  margin-bottom: 20px;
`;

const FoundersSpotlightButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const FoundersSpotlightButton = styled.a`
  background-color: #ff6868;
  color: #fff;
  border: none;
  border-radius: 25px;
  padding: 15px 30px;
  font-family: "Roboto Slab";
  font-size: 1em;
  text-decoration: none;
  cursor: pointer;
  margin: 0 10px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff8787;
  }
`;

const FoundersSpotlightDeadline = styled.p`
  font-family: "Roboto Slab";
  color: #656464;
  margin-bottom: 10px;
`;

const FoundersSpotlightContact = styled.p`
  font-family: "Roboto Slab";
  color: #656464;
`;

const FoundersSpotlight = () => {
  return (
    <FoundersSpotlightContainer id="FoundersSpotlight">
      <FoundersSpotlightTitle>Founders Spotlight</FoundersSpotlightTitle>
      <FoundersSpotlightDescription>
        UBC Startups is proud to announce the first event of the year, Founders
        Spotlight!
        <br />
        <br />
        There will be a diverse panel who have founded their own successful
        startups speak about their journey and you will have the opportunity to
        ask them about their experiences or any other questions about the
        industry. At the end of the panel, there'll be an open networking
        session.
        <br />
        <br />
        Please note this event is open to <b>STUDENTS FROM ALL FACULTIES</b>.
        You do not need a business background to attend; just an interest in
        entrepreneurship!
      </FoundersSpotlightDescription>
      <FoundersSpotlightButtonContainer>
        <FoundersSpotlightButton
          href="https://docs.google.com/forms/d/e/1FAIpQLScp0tkkJco9GgjxD-GpRfa9cEjEv0rugOlPsk6s02g7MBDbng/viewform"
          target="_blank"
        >
          Registration
        </FoundersSpotlightButton>
      </FoundersSpotlightButtonContainer>
      <FoundersSpotlightDeadline>
        Event Date: September 24th, 2024 (5:30pm - 8:30pm)
      </FoundersSpotlightDeadline>
      <FoundersSpotlightDeadline>
        More information TBA
      </FoundersSpotlightDeadline>

      <FoundersSpotlightContact>
        For questions or additional information, please contact{" "}
        <a href="mailto:ubcstartups@gmail.com">ubcstartups@gmail.com</a>.
      </FoundersSpotlightContact>
    </FoundersSpotlightContainer>
  );
};

export default FoundersSpotlight;
