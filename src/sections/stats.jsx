import React from "react";
import styled from "styled-components";

const StatsContainer = styled.div`
    position: relative;
    margin: 0 auto;
    margin-top: 10%;
    display: block;
    margin-bottom: 40px;
`;

const StatTitle = styled.h1`
    font-family: 'Sansation', sans-serif;
    font-weight: 400;
    text-align: center;
    font-size: 3em;
    margin-bottom: 80px;
`;

const StatGrid = styled.div`
    margin: 0 auto;
    display: grid;
    grid-gap: 60px;
    width: 90vw;
    justify-items: center;
    grid-template-columns: repeat(auto-fit, minmax(300px , 1fr));
`;

const StatItem = styled.div`
    background: #ffffff;
    box-shadow: 20px 20px 80px rgba(0, 0, 0, 0.1);
    border-radius: 24px;
    width: 300px;
    height: 250px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const StatNumber = styled.h2`
    font-family: 'Sansation', sans-serif;
    font-weight: 600;
    text-align: center;
    font-size: 3em;
    margin: 0 0 10px 0;
`;

const StatLabel = styled.p`
    font-family: 'Sansation', sans-serif;
    font-weight: 400;
    text-align: center;
    font-size: 2em;
    margin: 0;
`;

const Stats = () => {
    return (
        <StatsContainer>
            <StatTitle>Statistics</StatTitle>

            <StatGrid>
                <StatItem>
                    <StatNumber>15+</StatNumber>
                    <StatLabel>Events</StatLabel>
                </StatItem>

                <StatItem>
                    <StatNumber>$12,000+</StatNumber>
                    <StatLabel>Prizes Awarded</StatLabel>
                </StatItem>

                <StatItem>
                    <StatNumber>15+</StatNumber>
                    <StatLabel>Partners</StatLabel>
                </StatItem>
            </StatGrid>
        </StatsContainer>
    )
}

export default Stats;