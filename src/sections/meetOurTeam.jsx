import React from "react";
import styled from "styled-components";

import TeamMember from "../components/teamMember";

import arnavImg from "../images/teamPhotos/arnav.png"
import jeffreyImg from "../images/teamPhotos/jeffrey.png"
import karamImg from "../images/teamPhotos/karam.png"
import donaldImg from "../images/teamPhotos/donald.png"
import saumyaaImg from "../images/teamPhotos/saumyaa.png"

import sophieImg from "../images/teamPhotos/sophie.png"
import juliaImg from "../images/teamPhotos/julia.png"
import preritImg from "../images/teamPhotos/prerit.png"


const MeetOurTeamContainer = styled.div`
    height: auto;
`

const MOTTitle = styled.h1`
    font-family: 'Abril Fatface';
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
    font-size: 1.8em;
    text-align: center;
`

const MeetOurTeam = () => {
    return (
        <MeetOurTeamContainer>
            <MOTTitle>Meet our Team</MOTTitle>
            
            <TeamSectionText>Co-founders</TeamSectionText>
            <MOTContainer>
                <TeamMember
                    image={arnavImg}
                    name="Arnav Agrawal"
                    position="Co-founder"
                    role="Operations Lead"
                    linkedIn="https://www.linkedin.com/in/arnavagrawal29/"
                />
               <TeamMember
                    image={donaldImg}
                    name="Donald Lee"
                    position="Co-founder"
                    role="Technology Lead"
                    linkedIn="https://www.linkedin.com/in/donald-k-lee/"
                />
               <TeamMember
                    image={karamImg}
                    name="Karam Veer Kanwar"
                    position="Co-founder"
                    role="Corporate Relations Lead"
                    linkedIn="https://www.linkedin.com/in/kkanwar/"
                />
               <TeamMember
                    image={jeffreyImg}
                    name="Jeffrey Low"
                    position="Co-founder"
                    role="Community Relations Lead"
                    linkedIn="https://www.linkedin.com/in/jeffrey-low/"
                />
               <TeamMember
                    image={saumyaaImg}
                    name="Saumyaa Gandhi"
                    position="Co-founder"
                    role="Marketing Lead"
                    linkedIn="https://www.linkedin.com/in/saumyaagandhi/"
                />
            </MOTContainer>

            <TeamSectionText>Coordinators</TeamSectionText>

            <MOTContainer>
                <TeamMember
                    image={preritImg}
                    name="Prerit Khivesara"
                    position="Social Media Engagement"
                    role="Coordinator"
                    linkedIn="https://www.linkedin.com/in/preritkhi/"
                />
               <TeamMember
                    image={juliaImg}
                    name="Julia Avsec"
                    position="Human Resources"
                    role="Coordinator"
                    linkedIn="https://www.linkedin.com/in/julia-avsec-66b377253/"
                />
               <TeamMember
                    image={sophieImg}
                    name="Sophie Hu"
                    position="Social Media Engagement"
                    role="Coordinator"
                    linkedIn="https://www.linkedin.com/in/sophie-hu-181b3b258"
                />
            </MOTContainer>

        </MeetOurTeamContainer>
    )
}

export default MeetOurTeam;