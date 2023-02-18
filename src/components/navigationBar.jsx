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
`

const NavigationBar = () => {
    return (
        <NavBarDiv>
            <NavBarUl>
                <NavBarLi>About Us</NavBarLi>
                <NavBarLi>Events</NavBarLi>
                <NavBarLi>LinkedIn</NavBarLi>
                <NavBarLi>Instagram</NavBarLi>
            </NavBarUl>
        </NavBarDiv>
    )
}

export default NavigationBar;