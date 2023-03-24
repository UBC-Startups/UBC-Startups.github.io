import React from "react";
import styled from "styled-components";

import JobPosting from "../components/jobPosting"

// Company images
import AboutImage2 from "../images/AboutImage2.jpg" // Placeholder
import TwentyFiveBrunchImg from "../images/25under25.jpg"
import HIMMIImage from "../images/tempHIMMIImage.jpg"

const JobPostingsContainer = styled.div`
    width: 90vw;
    margin-bottom: 100px;
    display: block;
    margin: 0 auto;
`

const JobPostings = () => {
    return (
        <JobPostingsContainer>
            <JobPosting 
                image={AboutImage2}
                name="Company Name"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. In fringilla dapibus velit, non condimentum sem tincidunt id."
                positions={["Lorem ipsum dolor", "Lorem ipsum dolor", "Lorem ipsum dolor"]}
                url="https://youtube.com/"
            />
            <JobPosting 
                image={AboutImage2}
                name="Company Name"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. In fringilla dapibus velit, non condimentum sem tincidunt id."
                positions={["Lorem ipsum dolor", "Lorem ipsum dolor", "Lorem ipsum dolor"]}
                url="https://youtube.com/"
            />
            <JobPosting 
                image={AboutImage2}
                name="Company Name"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. In fringilla dapibus velit, non condimentum sem tincidunt id."
                positions={["Lorem ipsum dolor", "Lorem ipsum dolor", "Lorem ipsum dolor"]}
                url="https://youtube.com/"
            />
        </JobPostingsContainer>
    )
}

export default JobPostings;