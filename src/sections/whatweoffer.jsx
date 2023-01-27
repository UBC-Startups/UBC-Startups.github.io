import React from "react";
import styled from "styled-components";

import WWOContent from "../components/whatweoffercontent";

import InternshipsImage from "../images/InternshipsImg.svg"
import NetworkingImage from "../images/NetworkingImg.svg"
import ResourcesImage from "../images/ResourcesImg.svg"


const WhatWeOfferContainer = styled.div`
    position: relative;
    margin: 0 auto;
    // margin-top: 160px;
    display: block;
    margin-bottom: 100px;
`

const WWOTitle = styled.h1`
    font-family: 'Abril Fatface';
    text-align: center;
    font-size: 3em;
`

const WWOContentContainer = styled.div`
    margin: 0 auto;
    display: grid;
    grid-gap: 60px;
    width: 90vw;
    justify-items: center;
    grid-template-columns: repeat(auto-fit, minmax(300px , 1fr));

    margin-top: 140px;
`

const WhatWeOffer = () => {
    return (
        <WhatWeOfferContainer>
            <WWOTitle>What do we offer?</WWOTitle>

            <WWOContentContainer>
                <WWOContent
                    image={InternshipsImage}
                    title="Internship Opportunities"
                    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. In fringilla dapibus velit, non condimentum sem tincidunt id."
                    url="https://youtube.com/"
                />
                <WWOContent
                    image={NetworkingImage}
                    title="Networking Events"
                    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. In fringilla dapibus velit, non condimentum sem tincidunt id."
                    url="https://youtube.com/"
                />
                <WWOContent
                    image={ResourcesImage}
                    title="Resources"
                    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. In fringilla dapibus velit, non condimentum sem tincidunt id."
                    url="https://youtube.com/"
                />
            </WWOContentContainer>

        </WhatWeOfferContainer>
    )
}

export default WhatWeOffer;