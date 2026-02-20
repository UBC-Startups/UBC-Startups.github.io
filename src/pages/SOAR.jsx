import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import NavigationBar from "../components/navigationBar";
import Footer from "../sections/footer";
import SoarImage from "../images/eventPhotos/SOAR.png";

// "soar-2026": {
//         title: "SOAR 2026",
//         date: "March 22, 2026",
//         time: "10:00 AM - 2:00 PM",
//         location: "UBC Sauder School of Business, The Big 4 Conference Centre, 9th Floor",
//         image: require("../images/eventPhotos/SOAR.png"),
//         description: "Where UBC's boldest ideas take flight. ✈️ SOAR is UBC's flagship startup pitch competition, open to students across all faculties and experience levels. Founders at any stage—from early ideas to teams ready to scale—are welcome to compete. Whether you're testing an idea or building momentum, SOAR is where ideas turn into action.",
//         highlights: [
//             "💰 $10,000 non-dilutive cash prize",
//             "👔 Pitch to Canadian VCs & angel investors who will attend live",
//             "📈 Investors may reach out to teams, regardless of who wins",
//             "🎯 Gain feedback, visibility, and real connections in UBC's startup ecosystem",
//             "🏆 Two-round format: Online application → Live pitch to industry judges",
//             "⏰ Application Deadline: March 10, 11:59 PM PST"
//         ],
//         signupLink: "https://forms.gle/mUd3EHgtAnxCLAS67",
//         capacity: "Open to all UBC students across all faculties and experience levels. Apply by March 10!"
//     },

const Container = styled.div`
  overflow-x: hidden;
  position: relative;
  padding-top: 150px;
  min-height: 100vh;
  background: #f5f5f5;
`;

const PosterWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const BackButton = styled.button`
  background: #333333;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 30px;
  font-size: 1em;
  cursor: pointer;
  margin-bottom: 30px;
  transition: all 0.3s;

  &:hover {
    background: #000000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const PosterCard = styled.div`
  background: white;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
`;

const PosterImage = styled.div`
  width: 100%;
  height: 500px;
  background: ${(props) => `url(${props.src}) center/cover no-repeat`};
  position: relative;

  @media (max-width: 768px) {
    height: 350px;
  }
`;

const PosterContent = styled.div`
  padding: 50px;

  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const EventTitle = styled.h1`
  font-family: 'Sansation', sans-serif;
  font-size: 3em;
  color: #333;
  margin-bottom: 20px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 2em;
  }
`;

const EventDate = styled.div`
  text-align: center;
  font-size: 1.3em;
  color: #333333;
  margin-bottom: 30px;
  font-weight: 500;
`;

const EventDescription = styled.p`
  font-size: 1.1em;
  color: #656464;
  line-height: 1.8;
  margin-bottom: 30px;
  text-align: center;
`;

const SignUpSection = styled.div`
  text-align: center;
  padding: 40px 0;
  border-top: 2px solid #f1f3f5;
  margin-top: 30px;

  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
`;


const SignUpButton = styled.a`
  display: inline-block;
  background: #333333;
  color: white;
  text-decoration: none;
  padding: 18px 50px;
  border-radius: 30px;
  font-size: 1.3em;
  transition: all 0.3s;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

  &:hover {
    background: #000000;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    padding: 15px 35px;
    font-size: 1.1em;
  }
`;

const DetailsSection = styled.div`
  margin: 30px 0;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 20px;
`;

const DetailItem = styled.div`
  margin-bottom: 20px;
  
  strong {
    color: #333;
    font-size: 1.1em;
    display: block;
    margin-bottom: 8px;
  }
  
  span {
    color: #656464;
    font-size: 1em;
    line-height: 1.6;
  }
`;

const ContactInfo = styled.p`
  text-align: center;
  color: #656464;
  margin-top: 30px;
  font-size: 0.95em;

  a {
    color: #333333;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const SOAR = () => {
    const navigate = useNavigate();

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 110);
    }, []);

    return (
        <>
            <NavigationBar />
            <Container>
                <PosterWrapper>
                    <BackButton onClick={() => navigate(-1)}>
                        ← Back to Events
                    </BackButton>

                    <PosterCard>
                        <PosterImage src={SoarImage} />

                        <PosterContent>
                            <EventTitle>SOAR 2026</EventTitle>
                            <EventDate>March 22, 2026</EventDate>

                            <EventDescription>Where UBC's boldest ideas take flight. ✈️ SOAR is UBC's flagship startup pitch competition, open to students across all faculties and experience levels. Founders at any stage—from early ideas to teams ready to scale—are welcome to compete. Whether you're testing an idea or building momentum, SOAR is where ideas turn into action.</EventDescription>

                            <DetailsSection>
                                <DetailItem>
                                    <strong>📅 Date & Time</strong>
                                    <span>March 22, 2026 at 10:00 AM - 2:00 PM</span>
                                </DetailItem>

                                <DetailItem>
                                    <strong>📍 Location</strong>
                                    <span>UBC Sauder School of Business, The Big 4 Conference Centre, 9th Floor</span>
                                </DetailItem>

                                <DetailItem>
                                    <strong>Event Highlights</strong>
                                    <span>
                                        <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
                                            <li style={{ marginBottom: "8px" }}>
                                                💰 $10,000 non-dilutive cash prize
                                            </li>
                                            <li style={{ marginBottom: "8px" }}>
                                                👔 Pitch to Canadian VCs & angel investors who will attend live
                                            </li>
                                            <li style={{ marginBottom: "8px" }}>
                                                📈 Investors may reach out to teams, regardless of who wins
                                            </li>
                                            <li style={{ marginBottom: "8px" }}>
                                                🎯 Gain feedback, visibility, and real connections in UBC's startup ecosystem
                                            </li>
                                            <li style={{ marginBottom: "8px" }}>
                                                🏆 Two-round format: Online application → Live pitch to industry judges
                                            </li>
                                            <li style={{ marginBottom: "8px" }}>
                                                ⏰ Application Deadline: March 10, 11:59 PM PST
                                            </li>
                                        </ul>
                                    </span>
                                </DetailItem>
                                <DetailItem>
                                    <strong>Important</strong>
                                    <span>Open to all UBC students across all faculties and experience levels. Apply by March 10!</span>
                                </DetailItem>

                            </DetailsSection>

                            <SignUpSection>
                                <SignUpButton
                                    href="https://docs.google.com/document/d/1nKYKuUSEwx9d4x-68LYIr451P_VBsC3MhzjVL6ZJCHs/edit?tab=t.0"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    SOAR Rules
                                </SignUpButton>

                                <SignUpButton
                                    href="https://forms.gle/mUd3EHgtAnxCLAS67"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Apply to Pitch
                                </SignUpButton>

                                {/* disabled soar attend button till luma link available */}
                                <SignUpButton
                                    as="button"
                                    disabled
                                    style={{
                                        background: "#333333",
                                        opacity: 0.6,
                                        cursor: "not-allowed",
                                        boxShadow: "none"
                                    }}
                                >
                                    Attend SOAR
                                </SignUpButton>
                            </SignUpSection>


                            <ContactInfo>
                                Questions? Contact us at{" "}
                                <a href="mailto:ubcstartups@gmail.com">ubcstartups@gmail.com</a>
                            </ContactInfo>
                        </PosterContent>
                    </PosterCard>
                </PosterWrapper>
            </Container>
            <Footer />
        </>
    );
};

export default SOAR;
