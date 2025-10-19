import React from "react";
import styled from "styled-components";

import logo from "../images/Logo.svg"
import linkedin from "../images/linkedin.png";
import instagram from "../images/instagram.png";
import discord from "../images/discord.png";
import linkedin_c from "../images/linkedin-c.png";
import instagram_c from "../images/instagram-c.png";
import discord_c from "../images/discord-c.png";
import email from "../images/email.png";

const FooterContainer = styled.div`
    position: relative;
    background: #FFFFFF;
    height: auto;
    width: 90%;
    padding: 10px 5%;
    bottom: 0;
    content: "";
    display: table;
    clear: both;
    margin: 0 auto;
    box-shadow: 20px 20px 80px rgb(0 0 0 / 10%);
    border-radius: 30px 30px 0px 0px;
`

const FooterColumn = styled.div`
    float: left;
    position: relative;
    height: auto;

    @media (max-width: 1000px) {
        float: none;
        width: 100% !important;
      }
`

const FooterColumnUl = styled.ul`
    list-style-type: none;
    padding: 0;
`

const FooterColumnLiTitle = styled.li`
    font-family: 'Roboto Slab';
    font-weight: bold;
    font-size: 1.5em;
    text-align: left;
    color: #000000;
    text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    margin-bottom: 5px;

    @media (max-width: 1000px) {
        text-align: center;
        margin-top: 20px;
    }
`

const FooterColumnLi = styled.li`
    font-family: 'Inter';
    font-size: 1em;
    color: #656464;

    @media (max-width: 1000px) {
        text-align: center;
        margin: 10px 0;
    }
`

const FooterLogo = styled.img`
    width: 80px;
    height: auto;

    @media (max-width: 1000px) {
        display: block;
        margin: 0 auto;
    }
`

const FooterColumnA = styled.a`
    color: #656464;
    text-decoration: none;
    padding-right: 20px;

    &:hover {
        text-decoration: underline;
    }
`

const SocialImg = styled.img`
    width: 35px;
    height: 35px;
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

            <FooterColumn style={{ width: "10%" }}>
                <FooterColumnUl>
                    <FooterLogo src={logo} />
                </FooterColumnUl>
            </FooterColumn>

            <FooterColumn style={{ width: "30%" }}>
                <FooterColumnUl>
                    <FooterColumnLiTitle>UBC  Startups</FooterColumnLiTitle>
                    <FooterColumnLi>Building a startup</FooterColumnLi>
                    <FooterColumnLi>ecosystem on campus</FooterColumnLi>
                </FooterColumnUl>
            </FooterColumn>

            <FooterColumn style={{ width: "30%" }}>
                <FooterColumnUl>
                    <FooterColumnLiTitle>Find us on Social Media</FooterColumnLiTitle>
                    <FooterColumnA href="https://www.instagram.com/ubcstartups/" target="_blank">
                        <SocialImg src={instagram_c} alt="instagram" /></FooterColumnA>
                    <FooterColumnA href="https://www.linkedin.com/company/ubc-startups/" target="_blank">
                        <SocialImg src={linkedin_c} alt="linkedin" /></FooterColumnA>
                    <FooterColumnA href="https://discord.gg/6HEmMc2mCh" target="_blank">
                        <SocialImg src={discord_c} alt="discord" /></FooterColumnA>
                </FooterColumnUl>
            </FooterColumn>

            <FooterColumn style={{ width: "30%" }}>
                <FooterColumnUl>
                    <FooterColumnLiTitle>Contact</FooterColumnLiTitle>
                    <FooterColumnLi>
                        <FooterColumnA href="mailto:ubcstartups@gmail.com" target="_blank">
                            <SocialImg src={email} alt="email" />
                        </FooterColumnA>
                    </FooterColumnLi>
                </FooterColumnUl>
            </FooterColumn>
        </FooterContainer>
    )
}

export default Footer;