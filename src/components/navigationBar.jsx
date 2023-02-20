import React from "react";
import styled from "styled-components";

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
    height: 80px;
    line-height: 80px;
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
`

const NavBarA = styled.a`
    text-decoration: none;
    color: #000;
    &:hover {
        color: #656464;
        text-decoration: underline;
    }
`

const NavigationBar = () => {
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
            </NavBarUl>
        </NavBarDiv>
    )
}

export default NavigationBar;