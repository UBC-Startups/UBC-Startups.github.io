import React from "react";
import styled from "styled-components";
import NavigationBar from "../components/navigationBar";
import Footer from "../sections/footer";
import shapeDesign from "../images/HeroShapeDesign.svg";

import TeamMember from "../components/teamMember";

import defaultImg from "../images/Logo.svg"
import mostafaImg from "../images/teamPhotos/Mostafa.jpeg"
import andersonImg from "../images/teamPhotos/Anderson-Ko.png"
import angadImg from "../images/teamPhotos/Angad-Bhalla.jpg"
import katelynImg from "../images/teamPhotos/Katelyn-Jang.JPG"
import samuelImg from "../images/teamPhotos/Samuel-Ma.jpeg"
import lucasImg from "../images/teamPhotos/Lucas-Liu.png"
import dhananjaiImg from "../images/teamPhotos/Dhananjai Lekhi.png"
import zianImg from "../images/teamPhotos/Zian.png"
import anikaImg from "../images/teamPhotos/Anika.png"
import kaleenaImg from "../images/teamPhotos/Kaleena.png"
import kevishImg from "../images/teamPhotos/Kevish.png"
import cindyImg from "../images/teamPhotos/Cindy.png"
import sabrinaImg from "../images/teamPhotos/Sabrina.png"
import arpitaImg from "../images/teamPhotos/Arpita.png"
import ellaImg from "../images/teamPhotos/Ella.png"
import carolynImg from "../images/teamPhotos/Carolyn.png"
import adeenaImg from "../images/teamPhotos/Adeena.png"
import charleneImg from "../images/teamPhotos/Charlene.png"
import aniketImg from "../images/teamPhotos/Aniket.png"
import maddieImg from "../images/teamPhotos/Maddie.png"
import stevenImg from "../images/teamPhotos/Steven.png"
import ananyaaImg from "../images/teamPhotos/Ananyaa.png"
import shauryaImg from "../images/teamPhotos/Shaurya.png"
import roopImg from "../images/teamPhotos/Roop.png"
import eshaanImg from "../images/teamPhotos/Eshaan.png"
import arnavImg from "../images/teamPhotos/arnav.png"
import saumyaaImg from "../images/teamPhotos/saumyaa.png"
import jiyaImg from "../images/teamPhotos/Jiya.png"
import rheinImg from "../images/teamPhotos/Rhein.png"
import ayaanImg from "../images/teamPhotos/Ayaan.png"

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
    grid-template-columns: repeat(auto-fit, minmax(300px , 1fr));
    margin-top: 100px;
    margin-bottom: 100px;
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

                <TeamSectionText>Leadership</TeamSectionText>
                <MOTContainer>
                    <TeamMember
                        image={mostafaImg}
                        name="Mostafa Ali"
                        position=""
                        role="Co-President"
                        linkedIn="https://www.linkedin.com/in/mostafa57/"
                    />
                    <TeamMember
                        image={katelynImg}
                        name="Katelyn Jang"
                        position=""
                        role="Co-President"
                        linkedIn="https://www.linkedin.com/in/katelyn-jang-68ba6a2b0/"
                    />
                </MOTContainer>

                <MOTContainer>
                    <TeamMember
                        image={dhananjaiImg}
                        name="Dhananjai Lekhi"
                        position=""
                        role="VP Finance"
                        linkedIn="https://www.linkedin.com/in/dhananjai-lekhi-218ab2271/"
                    />
                    <TeamMember
                        image={ananyaaImg}
                        name="Ananyaa Kartik"
                        position=""
                        role="Co-VP Events"
                        linkedIn="https://linkedin.com/in/ananyaa-kartik-929b55244"
                    />
                    <TeamMember
                        image={carolynImg}
                        name="Carolyn Han"
                        position=""
                        role="Co-VP Events"
                        linkedIn="https://www.linkedin.com/in/carolyn-han-a46636273?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
                    />
                    <TeamMember
                        image={eshaanImg}
                        name="Eshaan Malhotra"
                        position=""
                        role="VP Marketing"
                        linkedIn="https://www.linkedin.com/in/eshaanmalhotra/"
                    />
                    <TeamMember
                        image={angadImg}
                        name="Angad Bhalla"
                        position=""
                        role="VP Partnership"
                        linkedIn="https://www.linkedin.com/in/angadsinghbhalla/"
                    />
                    <TeamMember
                        image={lucasImg}
                        name="Lucas Liu"
                        position=""
                        role="VP Tech"
                        linkedIn="https://www.linkedin.com/in/lucas-liu-32b566216/"
                    />
                    <TeamMember
                        image={samuelImg}
                        name="Samuel Ma"
                        position=""
                        role="VP Internal"
                        linkedIn="https://www.linkedin.com/in/samuel-ma8/"
                    />
                    <TeamMember
                        image={shauryaImg}
                        name="Shaurya Ahuja"
                        position=""
                        role="VP Admin"
                        linkedIn="https://www.linkedin.com/in/shauryaahuja/"
                    />
                </MOTContainer>

                <TeamSectionText>Advisors</TeamSectionText>
                <MOTContainer>
                    <TeamMember
                        image={arnavImg}
                        name="Arnav Agrawal"
                        position=""
                        role="Co-Founder/Advisor"
                        linkedIn="https://www.linkedin.com/in/arnavagrawal29"
                    />
                    <TeamMember
                        image={saumyaaImg}
                        name="Saumyaa Gandhi"
                        position=""
                        role="Co-Founder/Advisor"
                        linkedIn="https://www.linkedin.com/in/saumyaagandhi/"
                    />
                </MOTContainer>

                <TeamSectionText>Finance</TeamSectionText>

                <MOTContainer>
                    <TeamMember
                        image={andersonImg}
                        name="Anderson Ko"
                        position=""
                        role="Finance Director"
                        linkedIn="https://www.linkedin.com/in/anderson-ko/"
                    />
                    <TeamMember
                        image={arpitaImg}
                        name="Arpita Mali"
                        position=""
                        role="Finance Director"
                        linkedIn="https://linkedin.com/in/arpita-m-217b05212"
                    />
                    <TeamMember
                        image={defaultImg}
                        name="Ines Bouvier"
                        position=""
                        role="Finance Director"
                        linkedIn="defaultImg"
                    />
                    <TeamMember
                        image={cindyImg}
                        name="Cindy Li"
                        position=""
                        role="First-Year Rep"
                        linkedIn="https://linkedin.com/in/cindyli-ubcsauder29"
                    />
                </MOTContainer>

                <TeamSectionText>Events</TeamSectionText>

                <MOTContainer>
                    <TeamMember
                        image={kaleenaImg}
                        name="Kaleena Yen"
                        position=""
                        role="Events Director"
                        linkedIn="https://www.linkedin.com/in/kaleena-yen-674876369?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
                    />
                    <TeamMember
                        image={defaultImg}
                        name="Aryan Singh"
                        position=""
                        role="Events Director"
                        linkedIn="https://www.linkedin.com/in/aryan-singh-59a26226b/"
                    />
                    <TeamMember
                        image={sabrinaImg}
                        name="Sabrina Yuan"
                        position=""
                        role="Events Director"
                        linkedIn="https://linkedin.com/in/sabrina-yuan-062b4422b"
                    />
                    <TeamMember
                        image={defaultImg}
                        name="Mira Pascuzzi"
                        position=""
                        role="Events Director"
                        linkedIn=""
                    />
                    <TeamMember
                        image={defaultImg}
                        name="Sana Jalali"
                        position=""
                        role="Events Director"
                        linkedIn=""
                    />
                    <TeamMember
                        image={defaultImg}
                        name="Nicole Li"
                        position=""
                        role="Events Director"
                        linkedIn=""
                    />
                </MOTContainer>

                <TeamSectionText>Marketing</TeamSectionText>

                <MOTContainer>
                    <TeamMember
                        image={roopImg}
                        name="Roop Dhillon"
                        position=""
                        role="Marketing Director"
                        linkedIn="https://www.linkedin.com/in/roopkaurdhillon/"
                    />
                    <TeamMember
                        image={defaultImg}
                        name="Annie Fei"
                        position=""
                        role="Marketing Director"
                        linkedIn=""
                    />
                    <TeamMember
                        image={defaultImg}
                        name="Franklin Yuan"
                        position=""
                        role="Marketing Director"
                        linkedIn=""
                    />
                    <TeamMember
                        image={stevenImg}
                        name="Steven Cen"
                        position=""
                        role="Content Creator"
                        linkedIn="https://www.linkedin.com/in/stevencen"
                    />
                    <TeamMember
                        image={ellaImg}
                        name="Ella Chow"
                        position=""
                        role="Content Creator"
                        linkedIn="https://www.linkedin.com/in/ellachow26"
                    />
                    <TeamMember
                        image={zianImg}
                        name="Zian Zhao"
                        position=""
                        role="Graphic Designer"
                        linkedIn="https://www.linkedin.com/in/zian-zhao-87b18235a/"
                    />
                    <TeamMember
                        image={defaultImg}
                        name="Dilna Davi"
                        position=""
                        role="Graphic Designer"
                        linkedIn=""
                    />
                    <TeamMember
                        image={defaultImg}
                        name="Robin Tokko"
                        position=""
                        role="Graphic Designer"
                        linkedIn=""
                    />
                    <TeamMember
                        image={aniketImg}
                        name="Aniket Nemade"
                        position=""
                        role="Photographer"
                        linkedIn="https://www.linkedin.com/in/aniket-nemade"
                    />
                    <TeamMember
                        image={jiyaImg}
                        name="Jiya Grover"
                        position=""
                        role="Videographer"
                        linkedIn="https://www.linkedin.com/in/jiya-grover-18b381279/"
                    />
                </MOTContainer>

                <TeamSectionText>Partnerships</TeamSectionText>

                <MOTContainer>
                    <TeamMember
                        image={adeenaImg}
                        name="Adeena Saleem"
                        position=""
                        role="Partnership Director"
                        linkedIn="https://www.linkedin.com/in/adeenasaleem"
                    />
                    <TeamMember
                        image={defaultImg}
                        name="Jacky Zhong"
                        position=""
                        role="Partnership Director"
                        linkedIn="https://www.linkedin.com/in/zhong808800/"
                    />
                    <TeamMember
                        image={kevishImg}
                        name="Kevish Suri"
                        position=""
                        role="Partnership Director"
                        linkedIn="https://www.linkedin.com/in/kevishsuri"
                    />
                    <TeamMember
                        image={anikaImg}
                        name="Anika Shahzad"
                        position=""
                        role="Partnership Director"
                        linkedIn="https://www.linkedin.com/in/anika-shahzad-1b9452202?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
                    />
                    <TeamMember
                        image={ayaanImg}
                        name="Ayaan Kapoor"
                        position=""
                        role="Partnership Director"
                        linkedIn="https://www.linkedin.com/in/ayaan-kapoor-7b21aa2a1/"
                    />
                    <TeamMember
                        image={jiyaImg}
                        name="Jiya Grover"
                        position=""
                        role="Partnerships Director"
                        linkedIn="https://www.linkedin.com/in/jiya-grover-18b381279/"
                    />
                    <TeamMember
                        image={defaultImg}
                        name="Taha Salim"
                        position=""
                        role="Partnerships Director"
                        linkedIn=""
                    />
                </MOTContainer>

                <TeamSectionText>Tech</TeamSectionText>

                <MOTContainer>
                    <TeamMember
                        image={maddieImg}
                        name="Madilynn Wright"
                        position=""
                        role="Developer"
                        linkedIn="https://www.linkedin.com/in/madilynn-wright/"
                    />
                    <TeamMember
                        image={sabrinaImg}
                        name="Sabrina Yuan"
                        position=""
                        role="UI/UX Designer"
                        linkedIn="https://linkedin.com/in/sabrina-yuan-062b4422b"
                    />
                    <TeamMember
                        image={defaultImg}
                        name="Zahra Fiandika"
                        position=""
                        role="UI/UX Designer"
                        linkedIn=""
                    />
                </MOTContainer>

                <TeamSectionText>Internal</TeamSectionText>

                <MOTContainer>
                    <TeamMember
                        image={defaultImg}
                        name="Lauren Park"
                        position=""
                        role="Internal Director"
                        linkedIn=""
                    />
                    <TeamMember
                        image={defaultImg}
                        name="Naina Dhawan"
                        position=""
                        role="Internal Director"
                        linkedIn=""
                    />
                    <TeamMember
                        image={defaultImg}
                        name="Amarlin Battur"
                        position=""
                        role="Internal Director"
                        linkedIn=""
                    />
                </MOTContainer>

                <Footer />
            </MeetOurTeamContainer>
        </div>
    )
}

export default MeetOurTeam;