import React from "react";
import styled from "styled-components";

import logo from "../images/Logo.svg"

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
`

const FooterColumnUl = styled.ul`
    list-style-type: none;
    padding: 0;
`

const FooterColumnLiTitle = styled.li`
    font-family: 'Abril Fatface';
    font-weight: bold;
    font-size: 1.5em;
    text-align: left;
    color: #000000;
    text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    margin-bottom: 5px;
`

const FooterColumnLi = styled.li`
    font-family: 'Inter';
    font-size: 1em;
    color: #656464;
`

const FooterLogo = styled.img`
    width: 80px;
    height: auto;
`

const FooterColumnA = styled.a`
    color: #656464;
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
`

const Footer = () => {
    return (
        <FooterContainer>

            <FooterColumn style={{width: "10%"}}>
                <FooterColumnUl>
                    <FooterLogo src={logo} />
                </FooterColumnUl>
            </FooterColumn>

            <FooterColumn style={{width: "30%"}}>
                <FooterColumnUl>
                    <FooterColumnLiTitle>UBC  Startups</FooterColumnLiTitle>
                    <FooterColumnLi>Building a startup</FooterColumnLi>
                    <FooterColumnLi>ecosystem on campus</FooterColumnLi>
                </FooterColumnUl>
            </FooterColumn>

            <FooterColumn style={{width: "30%"}}>
                <FooterColumnUl>
                    <FooterColumnLiTitle>Find us on Social Media</FooterColumnLiTitle>
                    <FooterColumnLi>
                        <FooterColumnA href="https://www.instagram.com/ubcstartups/" target="_blank">Instagram</FooterColumnA>
                    </FooterColumnLi>
                    <FooterColumnLi>
                        <FooterColumnA href="https://www.linkedin.com/company/ubc-startups/" target="_blank">LinkedIn</FooterColumnA>
                    </FooterColumnLi>
                    <FooterColumnLi>
                        <FooterColumnA href="https://discord.gg/6HEmMc2mCh" target="_blank">Discord</FooterColumnA>
                    </FooterColumnLi>
                </FooterColumnUl>
            </FooterColumn>

            <FooterColumn style={{width: "30%"}}>
                <FooterColumnUl>
                    <FooterColumnLiTitle>Contact</FooterColumnLiTitle>
                    <FooterColumnLi>
                        <FooterColumnA href="mailto:ubcstartups@gmail.com" target="_blank">Email</FooterColumnA>
                    </FooterColumnLi>
                </FooterColumnUl>
            </FooterColumn>
        </FooterContainer>
    )
}

export default Footer;