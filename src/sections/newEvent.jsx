import React from "react";
import styled from "styled-components";

const NewEventContainer = styled.div`
  box-shadow: 20px 20px 80px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 800px;
  border-radius: 30px;
  margin: 40px auto;
  padding: 40px;
  text-align: center; /* Align all content to center */
`;

const NewEventTitle = styled.h1`
  font-family: "Roboto Slab";
  font-size: 3em;
  margin-bottom: 20px;
`;

const NewEventDescription = styled.p`
  font-family: "Roboto Slab";
  color: #656464;
  margin-bottom: 20px;
`;

const NewEventButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const NewEventButton = styled.a`
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

const NewEventDeadline = styled.p`
  font-family: "Roboto Slab";
  color: #656464;
  margin-bottom: 10px;
`;

const NewEventContact = styled.p`
  font-family: "Roboto Slab";
  color: #656464;
`;

const NewEvent = ({
  title,
  punchline,
  description,
  extraDetails,
  registrationLink,
  date,
}) => {
  return (
    <NewEventContainer id="NewEvent">
      <NewEventTitle>{title}</NewEventTitle>
      <NewEventDescription>
        {punchline}
        <br />
        <br />
        {description}
        <br />
        <br />
        {extraDetails}
      </NewEventDescription>
      <NewEventButtonContainer>
        <NewEventButton href={registrationLink} target="_blank">
          Registration
        </NewEventButton>
      </NewEventButtonContainer>
      <NewEventDeadline>Event Date: {date}</NewEventDeadline>
      <NewEventDeadline>More information TBA</NewEventDeadline>

      <NewEventContact>
        For questions or additional information, please contact{" "}
        <a href="mailto:ubcstartups@gmail.com">ubcstartups@gmail.com</a>.
      </NewEventContact>
    </NewEventContainer>
  );
};

export default NewEvent;
