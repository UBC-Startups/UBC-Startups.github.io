import React from "react";
import styled from "styled-components";


const JobPostingContainer = styled.div`
    background: white;
    width: 100%;
    height: 350px;
    overflow: hidden;
    position: relative;
    margin-bottom: 20px;
    box-shadow: 20px 20px 80px rgba(0, 0, 0, 0.1);
    border-radius: 30px;
    @media (max-width: 1000px) {
        height: auto;
    }
`
const JPLeftContainer = styled.div`
    float: left;
    width: 30%;
    @media (max-width: 1000px) {
        display: block;
        float:none;
        width: 100%;
    }
`
const JPImageContainer = styled.div`
    width: 240px;
    height: 240px;
    overflow: hidden;
    margin-top: 50px;
    margin-left: 30px;
    border-radius: 30px;
    @media (max-width: 1000px) {
        display: block;
        margin: 0 auto;
        margin-top: 30px;
        width: 180px;
        height: 180px;
    }
`

const JPImage = styled.img`
    width: auto;
    height: 100%;
`

const JPRightContainer = styled.div`
    position: relative;
    width: 65%;
    float: right;
    padding-left: 10px;
    padding-right: 2.5%;
    @media (max-width: 1000px) {
        display: block;
        float:none;
        width: 100%;
        padding: 0px 20px;
    }
`

const JPName = styled.p`
    font-family: 'Roboto Slab';
    font-weight: bold;
    font-size: 2em;
    color: #000000;
    @media (max-width: 1000px) {
        text-align: center;
    }
`

const JPDescription = styled.p`
    font-family: 'Roboto Slab';
    font-size: 1em;
    color: #656464;
`

const JPPositionsUL = styled.ul`

`

const JPPositionsLi = styled.li`
    font-family: 'Roboto Slab';
    font-size: 1em;
    color: #656464;
`

const JPApplyNow = styled.a`
    position: relative;
    display: inline-block;
    background: #B8F2FF;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 31.5px;
    text-decoration: none;
    padding: 5px 25px;
    color: #656464;
    font-family: 'Roboto Slab';
    position: relative;
    top: 10px;
    transition: 0.3s;
    &:hover {
        background: #D6F5FF;
    }
    @media (max-width: 1000px) {
        margin-bottom: 40px;
    }
    
`

const JobPosting = ({image, name, description, positions, url}) => {

    return (
        <JobPostingContainer>
            <JPLeftContainer>
                <JPImageContainer>
                    <JPImage src={image}/>
                </JPImageContainer>
            </JPLeftContainer>
            <JPRightContainer>
                <JPName>{name}</JPName>
                <JPDescription>{description}</JPDescription>
                <JPDescription>Positions:</JPDescription>
                <JPPositionsUL>
                    {positions.map((value, index) => (
                        <JPPositionsLi>{value}</JPPositionsLi>
                    ))
                    }
                </JPPositionsUL>

                <JPApplyNow href={url} target="_blank">Apply Now</JPApplyNow>
            </JPRightContainer>
        </JobPostingContainer>
    )
}

export default JobPosting;