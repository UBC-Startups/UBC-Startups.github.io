import React from "react";
import styled from "styled-components";

const WhatWeOfferContent = styled.div`
    display: inline-block;
    background: #FFFFFF;
    box-shadow: 20px 20px 80px rgba(0, 0, 0, 0.1);
    border-radius: 24px;
    height: 380px;
    width: 300px;
    margin-bottom: 60px;
`

const WWOTitle = styled.h2`
    font-family: 'Sansation', sans-serif;
    font-weight: 400;
    text-align: center;
    font-size: 2em;
    margin-top: -70px;
    height: 2.5em;
    margin-bottom: 0px;
    padding: 0px 20px;
`

const WWODescription = styled.p`
    text-align: center;
    padding: 0 10px;
    font-size: 1em;
`

const WWOImage = styled.img`
    position: relative;
    top: -80px;
    display: block;
    margin: 0 auto;
    margin-bottom: -40px;
`

const WWOContent = ({image, title, description}) => {

    return (
        <WhatWeOfferContent>
            <WWOImage src={image} />
            <WWOTitle>{title}</WWOTitle>
            <WWODescription>{description}</WWODescription>
            {/* <WWOLearnMore href={url} target="_blank">Learn More</WWOLearnMore> */}
        </WhatWeOfferContent>
    )
}

export default WWOContent;