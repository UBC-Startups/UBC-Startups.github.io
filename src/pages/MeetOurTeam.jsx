import React from "react";
import styled from "styled-components";
import NavigationBar from "../components/navigationBar";
import Footer from "../sections/footer";

import TeamMember from "../components/teamMember";

import defaultImg from "../images/Logo.svg"
import mostafaImg from "../images/teamPhotos/Mostafa.jpeg"
import nazikImg from "../images/teamPhotos/Nazik.png"
import andersonImg from "../images/teamPhotos/Anderson-Ko.png"
import angadImg from "../images/teamPhotos/Angad-Bhalla.jpg"
import katelynImg from "../images/teamPhotos/Katelyn-Jang.JPG"
import samuelImg from "../images/teamPhotos/Samuel-Ma.jpeg"
import lucasImg from "../images/teamPhotos/Lucas-Liu.png"
import dhananjaiImg from "../images/teamPhotos/Dhananjai Lekhi.png"
import elisabethImg from "../images/teamPhotos/Elisabeth.png"
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
import hasanImg from "../images/teamPhotos/Hasan.png"
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
  padding-top: 100px;
`

const MOTTitle = styled.h1`
    font-family: 'Roboto Slab';
    text-align: center;
    font-size: 3em;
    padding-bottom: 50px;
`

const MOTContainer = styled.div`
    margin: 0 auto;
    display: grid;
    grid-gap: 60px;
    width: 90vw;
    justify-items: center;
    grid-template-columns: repeat(auto-fit, minmax(300px , 1fr));
    margin-top: 100px;
`

const TeamSectionText = styled.h2`
    font-size: 2.5em;
    text-align: center;
`

const MeetOurTeam = () => {
    return (
        <MeetOurTeamContainer >
            <NavigationBar />
            <MOTTitle>Meet our Team</MOTTitle>

            <TeamSectionText>Leadership</TeamSectionText>
            <MOTContainer>
                <TeamMember
                    image={mostafaImg}
                    name="Mostafa"
                    position=""
                    role="Co-President"
                    linkedIn="https://www.linkedin.com/in/mostafa57/"
                />
                <TeamMember
                    image={nazikImg}
                    name="Nazik Zhumashalieva "
                    position=""
                    role="Co-President"
                    linkedIn="https://www.linkedin.com/in/nazik-zhumashalieva/"
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
                    image={katelynImg}
                    name="Katelyn Jang"
                    position=""
                    role="VP Events"
                    linkedIn="https://www.linkedin.com/in/katelyn-jang-68ba6a2b0/"
                />
                <TeamMember
                    image={ananyaaImg}
                    name="Ananyaa Kartik"
                    position=""
                    role="VP Events"
                    linkedIn="https://linkedin.com/in/ananyaa-kartik-929b55244"    
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
                    role="VP Engagement"
                    linkedIn="https://www.linkedin.com/in/samuel-ma8/"
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
                    image={shauryaImg}
                    name="Shaurya Ahuja"
                    position=""
                    role="Finance Director"
                    linkedIn="https://www.linkedin.com/in/shauryaahuja/"
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
                    image={carolynImg}
                    name="Carolyn Han"
                    position=""
                    role="Events Director"
                    linkedIn="https://www.linkedin.com/in/carolyn-han-a46636273?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
                />
                <TeamMember
                    image={hasanImg}
                    name="Hasan Noor"
                    position=""
                    role="Events Director"
                    linkedIn="https://www.linkedin.com/in/hasan-noor/"
                />
                <TeamMember
                    image={sabrinaImg}
                    name="Sabrina Yuan"
                    position=""
                    role="Events Director"
                    linkedIn="https://linkedin.com/in/sabrina-yuan-062b4422b"
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
                    image={stevenImg}
                    name="Steven Cen"
                    position=""
                    role="Marketing Director"
                    linkedIn="https://www.linkedin.com/in/stevencen"
                />
                <TeamMember
                    image={ellaImg}
                    name="Ella Chow"
                    position=""
                    role="Marketing Director"
                    linkedIn="https://www.linkedin.com/in/ellachow26"
                />
                <TeamMember
                    image={zianImg}
                    name="Zian Zhao"
                    position=""
                    role="Marketing Director"
                    linkedIn="https://www.linkedin.com/in/zian-zhao-87b18235a/"
                />
                <TeamMember
                    image={charleneImg}
                    name="Charlene Lo"
                    position=""
                    role="Marketing Director"
                    linkedIn="https://www.linkedin.com/in/charlene-lo?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
                />
                <TeamMember
                    image={aniketImg}
                    name="Aniket Nemade"
                    position=""
                    role="Marketing Director"
                    linkedIn="https://www.linkedin.com/in/aniket-nemade"
                />
                <TeamMember
                    image={jiyaImg}
                    name="Jiya Grover"
                    position=""
                    role="Marketing Director"
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
                    image={cindyImg}
                    name="Cindy Li"
                    position=""
                    role="First-Year Rep"
                    linkedIn="https://linkedin.com/in/cindyli-ubcsauder29"
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
            </MOTContainer>

            <TeamSectionText>Engagement</TeamSectionText>

            <MOTContainer>
                <TeamMember
                    image={rheinImg}
                    name="Rhein Ferdous"
                    position=""
                    role="Engagement Director"
                    linkedIn="https://www.linkedin.com/in/rhein-ferdous-96b31a1b0/"
                />
                <TeamMember
                    image={elisabethImg}
                    name="Elisabeth Mugerin"
                    position=""
                    role="Engagement Director"
                    linkedIn="https://www.linkedin.com/in/elisabeth-m-951424281"
                />
                <TeamMember
                    image={defaultImg}
                    name="Himanshi Wadhwani"
                    position=""
                    role="Engagement Director"
                    linkedIn="https://www.linkedin.com/in/himanshi-wadhwani-/"
                />
            </MOTContainer>

            <Footer />
        </MeetOurTeamContainer>

    )
}

export default MeetOurTeam;