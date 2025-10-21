import React from "react";
import styled from "styled-components";

const OurValuesContainer = styled.div`
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 40px;
`

const OVTitle = styled.h1`
    font-family: 'Sansation', sans-serif;
    font-weight: 400;
    text-align: center;
    font-size: 3em;
    margin-bottom: 20px;
`

const OVList = styled.ul`
    list-style-type: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* Align items to the left */
`

const OVListItem = styled.li`
    font-size: 1.5em;
    margin-bottom: 20px; /* Increase margin bottom for more spacing */
    display: flex;
    align-items: center;
`

const ValueCircle = styled.div`
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 20px; /* Increase margin right for more spacing */
`

const BoldnessCircle = styled(ValueCircle)`
    background-color: #DD3322;
`

const GrowthCircle = styled(ValueCircle)`
    background-color: #88DCBE;
`

const CommunityCircle = styled(ValueCircle)`
    background-color: #FF9735;
`

const ExclusivityCircle = styled(ValueCircle)`
    background-color: #171926;
`

const ValueTextContainer = styled.div`
    display: flex;
    flex-direction: column;
`

const ValueTitle = styled.strong`
    font-size: 1.2em; /* Decrease font size for the title */
    margin-bottom: 5px; /* Add some spacing between title and description */
    font-weight: 600;
    font-family: 'Sansation', sans-serif;
`

const ValueDescription = styled.p`
    font-size: 1em;
    color: #656464; /* Adjust color for better readability */
`

const OurValues = () => {
    return (
        <OurValuesContainer>
            <OVTitle>Our Values</OVTitle>

            <OVList>
                <OVListItem>
                    <BoldnessCircle />
                    <ValueTextContainer>
                        <ValueTitle>Boldness</ValueTitle>
                        <ValueDescription>We embrace risk, break patterns, and back creativity without apology. </ValueDescription>
                    </ValueTextContainer>
                </OVListItem>

                <OVListItem>
                    <GrowthCircle />
                    <ValueTextContainer>
                        <ValueTitle>Growth</ValueTitle>
                        <ValueDescription>We learn fast, grow faster, and build the confidence to shape our own path.</ValueDescription>
                    </ValueTextContainer>
                </OVListItem>

                <OVListItem>
                    <CommunityCircle />
                    <ValueTextContainer>
                        <ValueTitle>Community</ValueTitle>
                        <ValueDescription>We are a welcoming home for students and founders to connect and belong.</ValueDescription>
                    </ValueTextContainer>
                </OVListItem>

                <OVListItem>
                    <ExclusivityCircle />
                    <ValueTextContainer>
                        <ValueTitle>Exclusivity</ValueTitle>
                        <ValueDescription>We curate rare, intentional experiences that make members feel special.</ValueDescription>
                    </ValueTextContainer>
                </OVListItem>
            </OVList>
        </OurValuesContainer>
    )
}

export default OurValues;
