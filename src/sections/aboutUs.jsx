import React from "react";
import styled from "styled-components";

import AboutImage1 from "../images/AboutImage1.jpg"
import AboutImage2 from "../images/AboutImage2.jpg"

const AboutUsContainer = styled.div`
    box-shadow: 20px 20px 80px rgba(0, 0, 0, 0.1);
    width: 90vw;
    height: auto; 
    border-radius: 30px;
    display: block;
    margin: 0 auto;
    padding: 40px 40px;
    position: relative;
`

const AUTitle = styled.h1`
    font-family: 'Abril Fatface';
    text-align: center;
    font-size: 3em;
`

const AUContent = styled.div`
    display: block;
    margin: 0 auto;
    text-align: center;
    font-family: 'Inter';
    color: #656464;
`

const AboutImageContainer = styled.div`
    display: block;
    margin: 40px auto;
`

const AboutImage = styled.div`
    display: inline-block;
    width: 47.5%;
    height: 300px;
    background-size: cover;
    background-image: no-repeat;
    border-radius: 40px;
    position: relative;
`

const AboutUs = () => {
    return (
        <AboutUsContainer>
            <AUTitle>About Us</AUTitle>
            <AUContent>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque posuere eget tortor nec faucibus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales mauris eros, non placerat nisi feugiat et. Nunc laoreet metus ultrices dolor auctor, non gravida nisi lacinia. Quisque a pellentesque elit, eu iaculis turpis. Vivamus id dolor vitae nulla sollicitudin lacinia. Duis pharetra, risus non scelerisque molestie, magna magna elementum lacus, in facilisis lorem urna sed nulla. Aliquam tempus pellentesque eros malesuada euismod. Fusce placerat justo et iaculis lobortis.
                <br/><br/>
                Duis tempus imperdiet mattis. Ut ultrices malesuada nisi. Duis hendrerit, enim sed auctor ultrices, est eros congue orci, rutrum tempus odio metus et justo. Integer malesuada arcu non arcu eleifend ullamcorper. Aliquam at urna libero
            </AUContent>

            <AboutImageContainer>
                <AboutImage style={{backgroundImage: `url(${AboutImage1})`}}/>
                <AboutImage style={{backgroundImage: `url(${AboutImage2})`, float:"right"}}/>
            </AboutImageContainer>
        </AboutUsContainer>
    )
}

export default AboutUs;