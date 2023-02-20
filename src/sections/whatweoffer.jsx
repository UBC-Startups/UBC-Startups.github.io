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
                    description="UBC Startups offers a range of internship opportunities for students looking to gain real-world experience in the startup world. Our internships provide hands-on experience in areas such as marketing, operations, and business development. You'll work closely with startups in our network, gaining valuable insight into the inner workings of startups and the entrepreneurial process. The internships are designed to be both challenging and rewarding, offering opportunities for skill development, networking, and personal growth. If you're a student seeking a unique and enriching internship, apply through UBC Startups and take your first steps towards a successful career in the startup world!"
                    url="https://youtube.com/"
                />
                <WWOContent
                    image={NetworkingImage}
                    title="Networking Events"
                    description="UBC Startups is proud to offer a dynamic and inclusive networking events program to connect entrepreneurs, investors, and industry experts. Our events are designed to foster meaningful relationships and facilitate the exchange of ideas and resources. Whether you're looking to pitch your startup, find a co-founder, or simply connect with like-minded individuals, we have something for everyone. From coffee chats and startup showcases, to pitch competitions and investor dinners, our events are opportunities to learn, grow, and succeed. Join us at our next event and take the first step towards building your entrepreneurial community."
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