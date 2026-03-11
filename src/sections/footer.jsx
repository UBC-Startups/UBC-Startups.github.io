import React from "react";
import styled from "styled-components";

import linkedin_c from "../images/linkedin-c.png";
import instagram_c from "../images/instagram-c.png";
import discord_c from "../images/discord-c.png";
import email from "../images/email.png";

const FooterContainer = styled.div`
    width: 100%;
    background: #2b2b2b16;
    padding: 40px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
`

const IconsRow = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 60px;
    padding: 0;
`

const Copyright = styled.p`
    font-family: 'Inter';
    font-size: 0.9em;
    color: #656464;
    margin: 16px 0 0 0;
    text-align: center;
`

const FooterColumnA = styled.a`
    color: #656464;
    text-decoration: none;
`

const SocialImg = styled.img`
    width: 40px;
    height: 40px;
    object-fit: contain;
    cursor: pointer;
    transition: 0.3s;

    &:hover {
        transform: scale(1.1);
    }
`

const Footer = () => {
    return (
        <FooterContainer>
            <IconsRow>
                <FooterColumnA href="https://www.instagram.com/ubcstartups/" target="_blank">
                    <SocialImg src={instagram_c} alt="instagram" />
                </FooterColumnA>
                <FooterColumnA href="https://www.linkedin.com/company/ubc-startups/" target="_blank">
                    <SocialImg src={linkedin_c} alt="linkedin" />
                </FooterColumnA>
                <FooterColumnA href="https://discord.gg/6HEmMc2mCh" target="_blank">
                    <SocialImg src={discord_c} alt="discord" />
                </FooterColumnA>
                <FooterColumnA href="mailto:ubcstartups@gmail.com" target="_blank">
                    <SocialImg src={email} alt="email" />
                </FooterColumnA>
            </IconsRow>
            <Copyright>&copy; {new Date().getFullYear()} UBC Startups. All rights reserved.</Copyright>
        </FooterContainer>
    )
}

export default Footer;