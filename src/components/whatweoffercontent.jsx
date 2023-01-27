import React from "react";
import styled from "styled-components";

const WhatWeOfferContent = styled.div`
    display: inline-block;
    background: #FFFFFF;
    box-shadow: 20px 20px 80px rgba(0, 0, 0, 0.1);
    border-radius: 24px;
    height: 380px;
    width: 300px;
`

const WWOTitle = styled.h2`
    text-align: center;
    font-size: 2.5em;
    margin-top: -50px;
    height: 2.5em;
`

const WWODescription = styled.p`
    text-align: center;
`

const WWOLearnMore = styled.a`
    background: #FFDEB8;
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

    &:hover {
        // background: red;
    }

`

const WWOImage = styled.img`
    position: relative;
    top: -80px;
    display: block;
    margin: 0 auto;
    margin-bottom: -40px;
`

const WWOContent = ({image, title, description, url}) => {

    return (
        <WhatWeOfferContent>
            <WWOImage src={image} />
            <WWOTitle>{title}</WWOTitle>
            <WWODescription>{description}</WWODescription>
            <WWOLearnMore href={url} target="_blank">Learn More</WWOLearnMore>
        </WhatWeOfferContent>
    )
}

export default WWOContent;