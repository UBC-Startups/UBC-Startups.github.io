import React from "react";
import styled from "styled-components";

import TeamMember from "../components/teamMember";

import arnavImg from "../images/teamPhotos/arnav.png"
import jeffreyImg from "../images/teamPhotos/jeffrey.png"
import karamImg from "../images/teamPhotos/karam.png"
import donaldImg from "../images/teamPhotos/donald.png"
import saumyaaImg from "../images/teamPhotos/saumyaa.png"
import cynthiaImg from "../images/teamPhotos/cynthia.png"

import mostafaImg from "../images/teamPhotos/Mostafa.jpeg"
import nazikImg from "../images/teamPhotos/Nazik.png"
import andersonImg from "../images/teamPhotos/Anderson-Ko.png"
import angadImg from "../images/teamPhotos/Angad-Bhalla.jpg"
import katelynImg from "../images/teamPhotos/Katelyn-Jang.JPG"
import samuelImg from "../images/teamPhotos/Samuel-Ma.jpeg"
import lucasImg from "../images/teamPhotos/Lucas-Liu.png"

import sophieImg from "../images/teamPhotos/sophie.png"
import juliaImg from "../images/teamPhotos/julia.png"
import varunImg from "../images/teamPhotos/varun.png"
import jennyImg from "../images/teamPhotos/jenny.png"
import sofiaImg from "../images/teamPhotos/sofia.png"
import wyatImg from "../images/teamPhotos/wyat.png"

const MeetOurTeamContainer = styled.div`
    height: auto;
`

const MOTTitle = styled.h1`
    font-family: 'Roboto Slab';
    text-align: center;
    font-size: 3em;
`

const MOTContainer = styled.div`
    margin: 0 auto;
    display: grid;
    grid-gap: 60px;
    width: 90vw;
    justify-items: center;
    grid-template-columns: repeat(auto-fit, minmax(300px , 1fr));

    margin-top: 140px;
`

const TeamSectionText = styled.h2`
    font-size: 2.5em;
    text-align: center;
`

const MeetOurTeam = () => {
    return (
        <MeetOurTeamContainer>
            <MOTTitle>Meet our Team</MOTTitle>
            
            <TeamSectionText>Execs</TeamSectionText>
            <MOTContainer>
                <TeamMember
                    image={mostafaImg}
                    name="Mostafa"
                    position=""
                    role="Co-President"
                    linkedIn="https://www.linkedin.com/in/mostafa57/"
                />
                <TeamMember
                    image={nazikImg}
                    name="Nazik Zhumashalieva "
                    position=""
                    role="Co-President"
                    linkedIn="https://www.linkedin.com/in/nazik-zhumashalieva/"
                />
                <TeamMember
                    image={lucasImg}
                    name="Lucas Liu"
                    position=""
                    role="VP Tech"
                    linkedIn="https://www.linkedin.com/in/lucas-liu-32b566216/"
                />
               <TeamMember
                    image={angadImg}
                    name="Angad Bhalla"
                    position=""
                    role="VP Admin"
                    linkedIn="https://www.linkedin.com/in/angadsinghbhalla/"
                />
               <TeamMember
                    image={samuelImg}
                    name="Samuel Ma"
                    position=""
                    role="VP Engagement"
                    linkedIn="https://www.linkedin.com/in/samuel-ma8/"
                />
               <TeamMember
                    image={katelynImg}
                    name="Katelyn Jang"
                    position=""
                    role="VP Events"
                    linkedIn="https://www.linkedin.com/in/katelyn-jang-68ba6a2b0/"
                />
               
            </MOTContainer>

            <TeamSectionText>Coordinators</TeamSectionText>

            <MOTContainer>
                <TeamMember
                    image={andersonImg}
                    name="Anderson Ko"
                    position=""
                    role="Finance Director"
                    linkedIn="https://www.linkedin.com/in/anderson-ko/"
                />
            </MOTContainer>

        </MeetOurTeamContainer>
    )
}

export default MeetOurTeam;