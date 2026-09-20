import React from "react";
import styled from "styled-components";
import NavigationBar from "../components/navigationBar";
import Footer from "../sections/footer";
import shapeDesign from "../images/HeroShapeDesign.svg";

import TeamMember from "../components/teamMember";

import { teamSections } from "../data/team";

const MeetOurTeamContainer = styled.div`
    height: auto;
    padding-top: 150px;
`

const MOTTitle = styled.h1`
    font-family: 'Sansation', sans-serif;
    font-weight: 600;
    text-align: center;
    font-size: 3em;
`

const MOTContainer = styled.div`
    margin: 0 auto;
    display: grid;
    grid-gap: 60px;
    width: 90vw;
    justify-items: center;
    grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
    margin-top: 100px;
    margin-bottom: 100px;

    @media (max-width: 1133px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 733px) {
        grid-template-columns: minmax(0, 1fr);
    }
`

const TeamSectionText = styled.h2`
    font-family: 'Sansation', sans-serif;
    font-weight: 400;
    font-size: 2.5em;
    text-align: center;
    margin-top: 80px;
`

const BackgroundWrapper = styled.div`
    position: absolute;
    left: 0px;
    width: 100%;
    min-height: 100%;
    z-index: -1;
    pointer-events: none;

    background-image: url(${shapeDesign});
    background-repeat: repeat;
    background-position: top left;
    background-size: 100%;

    @media (max-width: 600px) {
        background-size: 100% 100vh;
        background-repeat: repeat;
    }
`;

const MeetOurTeam = () => {
    return (
        <div style={{ position: "relative", minHeight: "100%" }}>
            <BackgroundWrapper />

            <MeetOurTeamContainer >
                <NavigationBar />
                <MOTTitle>Meet our Team</MOTTitle>

                {teamSections.map(({ title, members }) => (
                    <section key={title} aria-label={title}>
                        <TeamSectionText>{title}</TeamSectionText>
                        {title === "Leadership" && (
                            <MOTContainer $columns={2}>
                                {members.filter((member) => member.role === "Co-President").map((member) => (
                                    <TeamMember key={member.name} {...member} />
                                ))}
                            </MOTContainer>
                        )}
                        <MOTContainer $columns={3}>
                            {members.filter((member) => title !== "Leadership" || member.role !== "Co-President").map((member) => (
                                <TeamMember key={member.name} {...member} />
                            ))}
                        </MOTContainer>
                    </section>
                ))}

                <Footer />
            </MeetOurTeamContainer>
        </div>
    )
}

export default MeetOurTeam;
