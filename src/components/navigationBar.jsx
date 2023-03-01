import React, {useState} from "react";
import styled, {keyframes} from "styled-components";

const NavBarDiv = styled.div`
    position: fixed;
    z-index: 1;
    top: 0px;
    width: 100%;
`

const NavBarUl = styled.ul`
    width: auto;
    list-style-type: none;
    display: block;
    margin: 0 auto;
    padding: 0 40px;
    overflow: hidden;
    background: #FFFFFF;
    height: 70px;
    line-height: 70px;
    text-align: center;
    box-shadow: 20px 20px 80px rgba(0, 0, 0, 0.1);
    border-radius: 0px 0px 30px 30px;
`

const NavBarLi = styled.li`
    display: inline;
    text-align: center;
    margin: 10px 20px;
    font-family: 'Inter', sans-serif;
    font-size: 1em;
    transition: 0.3s;
    cursor: pointer;
    &:hover {
        color: #656464;
        text-decoration: underline;
    }
    @media (max-width: 600px) {
        display: none;
    }
`

const NavBarA = styled.a`
    text-decoration: none;
    color: #000;
    &:hover {
        color: #656464;
        text-decoration: underline;
    }
`

const HamburgerLine = styled.span`
    position: relative;
    display: block;
    width: 20px;
    height: 2.5px;
    margin: 2.5px;
    background: #000;
    transition: 0.3s;
    right: 0;
`

const HamburgerContainer = styled.div`
    position: relative;
    display: none;
    float: right;
    top: 25px;
    cursor: pointer;
    &:hover ${HamburgerLine}  {
        background: #656464;
    }
    &:hover ${HamburgerLine}:nth-child(1) {
        // transform: rotate(22deg);
        right: 5px;
    }
    &:hover ${HamburgerLine}:nth-child(2) {
        right: 10px;
    }
    &:hover ${HamburgerLine}:nth-child(3) {
        // transform: rotate(-22deg);
        right: 5px;
    }
    @media (max-width: 600px) {
        display: inline-block;
    }
`


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
`

const CrossHamburgerContainer = styled.div`
    position: relative;
    float: right;
    top: 25px;
    cursor: pointer;
    transition: 0.3s;
    right: 40px;
    &:hover ${CrossHamburgerLine}  {
        background: #656464;
    }
    &:hover ${CrossHamburgerLine}:nth-child(1) {
        transform: rotate(25deg);
    }
    &:hover ${CrossHamburgerLine}:nth-child(2) {
        transform: rotate(-25deg);
    }
`


const MobileNavUl = styled.ul`
    width: auto;
    list-style-type: none;
    display: block;
    margin: 0 auto;
    padding: 0 40px;
    margin-top: 220px;
`

const MobileNavLi = styled.li`
    display: block;
    text-align: center;
    margin: 20px 20px;
    font-family: 'Inter', sans-serif;
    font-size: 1em;
    transition: 0.3s;
    cursor: pointer;
    &:hover {
        color: #656464;
        text-decoration: underline;
    }
`

const NavigationBar = () => {
    const [mobileNavState, setMobileNavState] = useState(false);
    let mobileNavPos = -500;
    let mobileTintState = "none";
    let mobileNavAni = "none";

    const slideMobileNavAni = keyframes`
        from {right: -500px;}
        to {right: 0px;}
    `
    // const slideOutMobileNavAni = keyframes`
    //     from {right: 0px;}
    //     to {right: -500px;}
    // `

    if (mobileNavState) {
        mobileNavPos = 0;
        mobileTintState = "block";
        mobileNavAni = slideMobileNavAni;
        
    } else {
        mobileNavPos = -500;
        mobileTintState = "none";
        // mobileNavAni = slideOutMobileNavAni;
    }

    const MobileNavSlideIn = styled.div`
        top: 0;
        width: 70%;
        height: 100vh;
        position: fixed;
        background: #fff;
        transition: 0.3s;
        right: ${mobileNavPos}px;
        box-shadow: -5px 0 10px -10px #000000;
        animation-name: ${mobileNavAni};
        animation-duration: 1s;
        display: none;
        @media (max-width: 600px) {
            display: block;
        }
    `

    const MobileNavTint = styled.div`
        top: 0;
        width: 100%;
        height: 100vh;
        position: fixed;
        background: #000;
        opacity: 0.5;
        display: ${mobileTintState};
        cursor: pointer;
    `

    function scrollTo(section) {
        const element = document.getElementById(section);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    return (
        <NavBarDiv>
            <NavBarUl>
                <NavBarLi onClick={() => scrollTo("aboutUs")}>About Us</NavBarLi>
                <NavBarLi onClick={() => scrollTo("events")}>Events</NavBarLi>
                <NavBarLi><NavBarA href="https://www.linkedin.com/company/ubc-startups/" target="_blank">LinkedIn</NavBarA></NavBarLi>
                <NavBarLi><NavBarA href="https://www.instagram.com/ubcstartups/" target="_blank">Instagram</NavBarA></NavBarLi>

                <HamburgerContainer onClick={() => setMobileNavState(true)}>
                    <HamburgerLine />
                    <HamburgerLine />
                    <HamburgerLine />
                </HamburgerContainer>
            </NavBarUl>

            <MobileNavTint onClick={() => setMobileNavState(false)}/>
            <MobileNavSlideIn>
                <CrossHamburgerContainer onClick={() => setMobileNavState(false)}>
                    <CrossHamburgerLine />
                    <CrossHamburgerLine />
                </CrossHamburgerContainer>

                <MobileNavUl>
                    <MobileNavLi onClick={() => {scrollTo("aboutUs"); setMobileNavState(false)}}>About Us</MobileNavLi>
                    <MobileNavLi onClick={() => {scrollTo("events"); setMobileNavState(false)}}>Events</MobileNavLi>
                    <MobileNavLi onClick={() => {setMobileNavState(false)}}><NavBarA href="https://www.linkedin.com/company/ubc-startups/" target="_blank">LinkedIn</NavBarA></MobileNavLi>
                    <MobileNavLi onClick={() => {setMobileNavState(false)}}><NavBarA href="https://www.instagram.com/ubcstartups/" target="_blank">Instagram</NavBarA></MobileNavLi>
                </MobileNavUl>
            </MobileNavSlideIn>
        </NavBarDiv>
    )
}

export default NavigationBar;