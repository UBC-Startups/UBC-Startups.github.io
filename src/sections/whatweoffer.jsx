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
    margin-bottom: 40px;
`

const WWOTitle = styled.h1`
    font-family: 'Roboto Slab';
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
                    description="We promote internship opportunities from our partners for students looking to gain real-world experience in the startup world. Our internships provide hands-on experience in areas such as marketing, tech, operations, and business development."
                    url="https://youtube.com/"
                />
                <WWOContent
                    image={NetworkingImage}
                    title="Networking Events"
                    description="We offer a dynamic and inclusive networking events to connect entrepreneurs, investors, and industry experts. Whether you're looking to pitch your startup, find a co-founder, or simply meet like-minded individuals, we have something for everyone. "
                    url="https://youtube.com/"
                />
                <WWOContent
                    image={ResourcesImage}
                    title="Resources"
                    description="We offer and promote a variety of resources for aspiring entrepreneurs to help turn their ideas into reality! Follow us on Instagram or Join our Discord community of aspiring and like-minded entrepreneurs! We’re here to help you and your dreams!"
                    url="https://youtube.com/"
                />
            </WWOContentContainer>

        </WhatWeOfferContainer>
    )
}

export default WhatWeOffer;