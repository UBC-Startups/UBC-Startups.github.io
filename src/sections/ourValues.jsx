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
    font-family: 'Roboto Slab';
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

const AccessibilityCircle = styled(ValueCircle)`
    background-color: #DD3322;
`

const InclusivityCircle = styled(ValueCircle)`
    background-color: #88DCBE;
`

const GrowthCircle = styled(ValueCircle)`
    background-color: #FF9735;
`

const InnovationCircle = styled(ValueCircle)`
    background-color: #171926;
`

const ValueTextContainer = styled.div`
    display: flex;
    flex-direction: column;
`

const ValueTitle = styled.strong`
    font-size: 1.2em; /* Decrease font size for the title */
    margin-bottom: 5px; /* Add some spacing between title and description */
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
                    <AccessibilityCircle />
                    <ValueTextContainer>
                        <ValueTitle>Accessibility</ValueTitle>
                        <ValueDescription>Creating an open and inclusive free events for everyone.</ValueDescription>
                    </ValueTextContainer>
                </OVListItem>

                <OVListItem>
                    <InclusivityCircle />
                    <ValueTextContainer>
                        <ValueTitle>Inclusivity</ValueTitle>
                        <ValueDescription>Fostering an environment that celebrates diversity and different perspectives.</ValueDescription>
                    </ValueTextContainer>
                </OVListItem>

                <OVListItem>
                    <GrowthCircle />
                    <ValueTextContainer>
                        <ValueTitle>Growth</ValueTitle>
                        <ValueDescription>Dedicated to supporting the continuous learning and development of individuals.</ValueDescription>
                    </ValueTextContainer>
                </OVListItem>

                <OVListItem>
                    <InnovationCircle />
                    <ValueTextContainer>
                        <ValueTitle>Innovation</ValueTitle>
                        <ValueDescription>Championing creative thinking and the pursuit of groundbreaking ideas.</ValueDescription>
                    </ValueTextContainer>
                </OVListItem>
            </OVList>
        </OurValuesContainer>
    )
}

export default OurValues;
