import React from "react";
import styled from "styled-components";

import TeamMember from "../components/teamMember";

import InternshipsImage from "../images/InternshipsImg.svg"
import NetworkingImage from "../images/NetworkingImg.svg"
import ResourcesImage from "../images/ResourcesImg.svg"

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
                    image={InternshipsImage}
                    name="Arnav Agrawal"
                    position="Co-founder"
                    role="Operations Lead"
                    linkedIn="https://youtube.com/"
                />
               <TeamMember
                    image={InternshipsImage}
                    name="Donald Lee"
                    position="Co-founder"
                    role="Technology Lead"
                    linkedIn="https://youtube.com/"
                />
               <TeamMember
                    image={InternshipsImage}
                    name="Karam Veer Kanwar"
                    position="Co-founder"
                    role="Director"
                    linkedIn="https://youtube.com/"
                />
               <TeamMember
                    image={InternshipsImage}
                    name="Jeffrey Low"
                    position="Co-founder"
                    role="Director"
                    linkedIn="https://youtube.com/"
                />
               <TeamMember
                    image={InternshipsImage}
                    name="Saumyaa Gandhi"
                    position="Co-founder"
                    role="Marketing Lead"
                    linkedIn="https://youtube.com/"
                />
            </MOTContainer>

            <TeamSectionText>Coordinators</TeamSectionText>

            <MOTContainer>
                <TeamMember
                    image={InternshipsImage}
                    name="Prerit Khivesara"
                    position="Social Media Engagement"
                    role="Coordinator"
                    linkedIn="https://youtube.com/"
                />
               <TeamMember
                    image={InternshipsImage}
                    name="Julia Avsec"
                    position="Human Resources"
                    role="Director"
                    linkedIn="https://youtube.com/"
                />
               <TeamMember
                    image={InternshipsImage}
                    name="Sophie Hu"
                    position="Social Media Engagement"
                    role="Coordinator"
                    linkedIn="https://youtube.com/"
                />
            </MOTContainer>

        </MeetOurTeamContainer>
    )
}

export default MeetOurTeam;