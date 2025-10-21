import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

import logo from "../images/Logo.svg";
import linkedin_c from "../images/linkedin-c.png";
import instagram_c from "../images/instagram-c.png";
import discord_c from "../images/discord-c.png";

const NavBarDiv = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  border-radius: 0 0 30px 30px;
`;

const NavBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  height: 80px;
  

  @media (max-width: 800px) {
    padding: 0 20px;
  }
`;

const LeftNavGroup = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.div`
  cursor: pointer;
  margin-top: 5px;
`;

const LogoImg = styled.img`
  width: 70px;
  height: 70px;
  object-fit: contain;
`;

const NavLinks = styled.ul`
  list-style: none;
  display: flex;
  gap: 40px;

  @media (max-width: 800px) {
    display: none;
  }
`;

const NavLinkItem = styled.li`
  font-size: 1.2em;
  font-weight: 300;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    color: #989898ff;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 40px;
  align-items: center;

  @media (max-width: 800px) {
    display: none;
  }
`;

const SocialImg = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    transform: scale(1.1);
  }
`;

const HamburgerLine = styled.span`
    position: relative;
    display: block;
    width: 20px;
    height: 2.5px;
    margin: 2.5px;
    background: #000;
    transition: 0.3s;
    right: 10px;
`;

const HamburgerContainer = styled.div`
    position: relative;
    display: none;
    float: right;
    cursor: pointer;
    &:hover ${HamburgerLine}  {
        background: #656464;
    }
    &:hover ${HamburgerLine}:nth-child(1) {
        // transform: rotate(22deg);
        right: 15px;
    }
    &:hover ${HamburgerLine}:nth-child(2) {
        right: 20px;
    }
    &:hover ${HamburgerLine}:nth-child(3) {
        // transform: rotate(-22deg);
        right: 15px;
    }
    @media (max-width: 800px) {
        display: inline-block;
    }
`;


const CrossHamburgerLine = styled.span`
    position: relative;
    display: block;
    width: 20px;
    height: 2.5px;
    margin: 2.5px;
    background: #000;
    transition: 0.3s;
    &:nth-child(1) {
        transform: rotate(45deg);
    }
    &:nth-child(2) {
        top: -5px;
        transform: rotate(-45deg);
    }
`;

const CrossHamburgerContainer = styled.div`
    position: relative;
    float: right;
    top: 35px;
    cursor: pointer;
    transition: 0.3s;
    right: 30px;
    &:hover ${CrossHamburgerLine}  {
        background: #656464;
    }
`;

const slideMobileNavAni = keyframes`
  from { top: -100%; opacity: 0; }
  to { top: 0; opacity: 1; }
`;

const MobileNavSlideIn = styled.div`
  position: fixed;
  top: ${(props) => (props.open ? "0" : "-100%")};
  left: 0;
  width: 100%;
  height: 40vh;
  background: #fff;
  transition: top 0.4s ease-in-out;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  animation: ${(props) => (props.open ? slideMobileNavAni : "none")} 0.5s ease forwards;
  display: none;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  z-index: 120;

  @media (max-width: 800px) {
    display: block;
  }
`;

const MobileNavTint = styled.div`
  display: ${(props) => (props.open ? "block" : "none")};
  position: fixed;
  top: 0;
  width: 100%;
  height: 100vh;
  background: #000;
  opacity: 0.5;
  z-index: 100;
  cursor: pointer;
`;

const MobileNavUl = styled.ul`
  width: auto;
  list-style-type: none;
  display: block;
  margin-top: 25px;
  padding: 0 40px;
`;

const MobileNavLi = styled.li`
  display: block;
  margin: 35px 20px;
  font-weight: 300;
  font-size: 1.1em;
  transition: 0.3s;
  cursor: pointer;
  text-decoration: none;
  color: #000;

  &:hover {
    color: #656464;
  }
`;

const MobileSocials = styled.div`
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  margin-left: 20px;
`;

const MobileSocialImg = styled(SocialImg)`
  width: 35px;
  height: 35px;
`;

const NavigationBar = () => {
    const [mobileNavState, setMobileNavState] = useState(false);
    const scrollToTop = () => window.scrollTo({ top: 0 });

    return (
        <NavBarDiv>
            <NavBarContainer>
                <LeftNavGroup>
                    <Logo onClick={scrollToTop}><LogoImg src={logo} alt="logo" /></Logo>

                    <NavLinks>
                        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <NavLinkItem onClick={scrollToTop}>Home</NavLinkItem>
                        </Link>
                        <HashLink smooth to="/#aboutUs" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <NavLinkItem>About Us</NavLinkItem>
                        </HashLink>
                        <HashLink smooth to="/#events" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <NavLinkItem>Events</NavLinkItem>
                        </HashLink>
                        <a href="/meetOurTeam" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <NavLinkItem>Team</NavLinkItem>
                        </a>
                    </NavLinks>
                </LeftNavGroup>

                <SocialLinks>
                    <a href="https://www.linkedin.com/company/ubc-startups/" target="_blank" rel="noreferrer">
                        <SocialImg src={linkedin_c} alt="linkedin" />
                    </a>
                    <a href="https://www.instagram.com/ubcstartups/" target="_blank" rel="noreferrer">
                        <SocialImg src={instagram_c} alt="instagram" />
                    </a>
                    <a href="https://discord.gg/6HEmMc2mCh" target="_blank" rel="noreferrer">
                        <SocialImg src={discord_c} alt="discord" />
                    </a>
                </SocialLinks>

                {!mobileNavState && (
                    <HamburgerContainer onClick={() => setMobileNavState(true)}>
                        <HamburgerLine />
                        <HamburgerLine />
                        <HamburgerLine />
                    </HamburgerContainer>
                )}
            </NavBarContainer>

            <MobileNavTint open={mobileNavState} onClick={() => setMobileNavState(false)} />

            <MobileNavSlideIn open={mobileNavState}>
                <CrossHamburgerContainer onClick={() => setMobileNavState(false)}>
                    <CrossHamburgerLine />
                    <CrossHamburgerLine />
                </CrossHamburgerContainer>

                <MobileNavUl>
                    <MobileSocials>
                        <a href="https://www.linkedin.com/company/ubc-startups/" target="_blank" rel="noreferrer">
                            <MobileSocialImg src={linkedin_c} alt="linkedin" />
                        </a>
                        <a href="https://www.instagram.com/ubcstartups/" target="_blank" rel="noreferrer">
                            <MobileSocialImg src={instagram_c} alt="instagram" />
                        </a>
                        <a href="https://discord.gg/6HEmMc2mCh" target="_blank" rel="noreferrer">
                            <MobileSocialImg src={discord_c} alt="discord" />
                        </a>
                    </MobileSocials>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <MobileNavLi onClick={() => { scrollToTop(); setMobileNavState(false); }}>Home</MobileNavLi>
                    </Link>
                    <HashLink to="/#aboutUs" style={{ textDecoration: 'none' }}>
                        <MobileNavLi onClick={() => setMobileNavState(false)}>About Us</MobileNavLi>
                    </HashLink>
                    <HashLink smooth to="/#events" style={{ textDecoration: 'none' }}>
                        <MobileNavLi onClick={() => setMobileNavState(false)}>Events</MobileNavLi>
                    </HashLink>
                    <Link to="/meetOurTeam" style={{ textDecoration: 'none' }}>
                        <MobileNavLi onClick={() => { scrollToTop(); setMobileNavState(false); }}>Team</MobileNavLi>
                    </Link>
                </MobileNavUl>
            </MobileNavSlideIn>
        </NavBarDiv>
    );
};

export default NavigationBar;
