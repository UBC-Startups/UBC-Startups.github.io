import React from "react";
import styled from "styled-components";

const SoarContainer = styled.div`
    box-shadow: 20px 20px 80px rgba(0, 0, 0, 0.1);
    width: 80%;
    max-width: 800px;
    border-radius: 30px;
    margin: 40px auto;
    padding: 40px;
    text-align: center; /* Align all content to center */
`

const SoarTitle = styled.h1`
    font-family: 'Roboto Slab';
    font-size: 3em;
    margin-bottom: 20px;
`

const SoarDescription = styled.p`
    font-family: 'Roboto Slab';
    color: #656464;
    margin-bottom: 20px;
`

const SoarButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
`

const SoarButton = styled.a`
    background-color: #FF6868;
    color: #fff;
    border: none;
    border-radius: 25px;
    padding: 15px 30px;
    font-family: 'Roboto Slab';
    font-size: 1em;
    text-decoration: none;
    cursor: pointer;
    margin: 0 10px;
    transition: background-color 0.3s;

    &:hover {
        background-color: #ff8787;
    }
`

const SoarDeadline = styled.p`
    font-family: 'Roboto Slab';
    color: #656464;
    margin-bottom: 10px;
`

const SoarContact = styled.p`
    font-family: 'Roboto Slab';
    color: #656464;
`

const Soar = () => {
    return (
        <SoarContainer id="Soar">
            <SoarTitle>Soar Startup Pitch Competition</SoarTitle>
            <SoarDescription>
                UBC Startups in partnership with UBC Computer Science Student Society (CSSS) are thrilled to announce the first iteration of the Soar Startup Pitch Competition, a premier event designed to showcase the entrepreneurial talent and innovative ideas within the UBC community.<br/><br/>This competition offers an unparalleled opportunity for students across all levels and disciplines to present their startup ideas, gain invaluable feedback, and vie for a <b>$10,000 non-dilutive cash prize</b>.
            </SoarDescription>
            <SoarButtonContainer>
                <SoarButton href="https://docs.google.com/document/d/1nKYKuUSEwx9d4x-68LYIr451P_VBsC3MhzjVL6ZJCHs/edit?usp=sharing" target="_blank">Rules & Information</SoarButton>
                <SoarButton href="https://docs.google.com/forms/d/e/1FAIpQLScwKGE2NYmSGNC22D981qzxgrH88hx7Pxknns1FmusfxBt-3g/viewform" target="_blank">Application</SoarButton>
            </SoarButtonContainer>
            <SoarDeadline>Application deadline: Wednesday, March 13, 2024, at 11:59 pm PST</SoarDeadline>
            <SoarDeadline>Event Date: Saturday, March 23rd, 2024</SoarDeadline>
            <SoarDeadline>More information TBA</SoarDeadline>

            <SoarContact>For questions or additional information, please contact <a href="mailto:ubcstartups@gmail.com">ubcstartups@gmail.com</a>.</SoarContact>
        </SoarContainer>
    )
}

export default Soar;