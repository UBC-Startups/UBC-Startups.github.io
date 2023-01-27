import React from "react";
import styled from "styled-components";

const MeetOurTeamContainer = styled.div`
    height: 100vh;
`

const MOTTitle = styled.h1`
    font-family: 'Abril Fatface';
    text-align: center;
    font-size: 3em;
`

const MeetOurTeam = () => {
    return (
        <MeetOurTeamContainer>
            <MOTTitle>Meet our Team</MOTTitle>
        </MeetOurTeamContainer>
    )
}

export default MeetOurTeam;