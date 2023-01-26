import React from "react";
import styled from "styled-components";

const NavBarUl = styled.ul`
    position: fixed;
    z-index: 1;
    top: 0px;
    width: 100vw;
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: #FFFFFF;
    height: 80px;
    line-height: 80px;
    text-align: center;
    box-shadow: 20px 20px 80px rgba(0, 0, 0, 0.1);
`

const NavBarLi = styled.li`
    display: inline;
    text-align: center;
    margin: 10px 20px;
    font-family: 'Inter', sans-serif;
    font-size: 1em;
`

const NavigationBar = () => {
    return (
        <NavBarUl>
            <NavBarLi>About Us</NavBarLi>
            <NavBarLi>Events</NavBarLi>
            <NavBarLi>LinkedIn</NavBarLi>
            <NavBarLi>Instagram</NavBarLi>
        </NavBarUl>
    )
}

export default NavigationBar;