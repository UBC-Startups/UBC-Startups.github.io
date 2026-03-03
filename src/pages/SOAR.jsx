import React, { useEffect } from "react";
import styled from "styled-components";
import NavigationBar from "../components/navigationBar";
import Footer from "../sections/footer";
import SoarHero from "../images/eventPhotos/SOAR.png";
import SoarEventPhoto from "../images/eventPhotos/soar2025.jpg";
import Skyscraper from "../images/skyscraper.png";
import SoarLogo from "../images/eventPhotos/Soar Logo.png";
import Clouds from "../images/clouds.jpg";
// ─── Styled Components ────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  overflow-x: hidden;
`;

/* ── Hero ── */
const HeroSection = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 560px;
  background: url(${Skyscraper}) center/cover no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 0 8%;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
`;

const HeroLogoImg = styled.img`
  height: clamp(80px, 18vw, 200px);
  width: auto;
  margin-bottom: 8px;
  display: block;
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.4rem);
  color: #e8e8e8;
  font-style: italic;
  margin: 0 0 36px;
`;

const HeroButton = styled.a`
  display: inline-block;
  background: #ffffff;
  color: #111111;
  text-decoration: none;
  padding: 14px 42px;
  border-radius: 30px;
  font-size: 1.05rem;
  font-weight: 600;
  transition: background 0.25s, color 0.25s, box-shadow 0.25s;
  box-shadow: 0 6px 20px rgba(0,0,0,0.25);

  &:hover {
    background: #111111;
    color: #ffffff;
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  }
`;

/* ── Info Bar ── */
const InfoBar = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 30px 8%;
  background: #ffffff;
  border: 1.5px solid #e0e0e0;
  border-radius: 16px;
  margin: 40px 8%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 160px;
`;

const InfoIcon = styled.span`
  font-size: 1.4rem;
  margin-bottom: 6px;
`;

const InfoLabel = styled.span`
  font-weight: 700;
  font-size: 1rem;
  color: #111111;
  margin-bottom: 4px;
`;

const InfoValue = styled.span`
  font-size: 0.92rem;
  color: #555555;
  line-height: 1.5;
`;

const InfoDivider = styled.div`
  width: 1px;
  height: 60px;
  background: #e0e0e0;

  @media (max-width: 640px) {
    display: none;
  }
`;

/* ── What is SOAR ── */
const WhatSection = styled.div`
  display: flex;
  align-items: center;
  gap: 60px;
  padding: 60px 8%;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 30px;
  }
`;

const WhatText = styled.div`
  flex: 1;
`;

const WhatTitle = styled.h2`
  font-family: 'Sansation', sans-serif;
  font-size: 3.2rem;
  color: #111111;
  margin-bottom: 60px;
`;

const WhatDescription = styled.p`
  font-size: 1rem;
  color: #555555;
  line-height: 1.8;
`;

const WhatImage = styled.img`
  flex: 1;
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 10px 40px rgba(0,0,0,0.12);
`;

/* ── Highlights ── */
const HighlightsSection = styled.div`
  position: relative;
  padding: 80px 8%;
  background: url(${Clouds}) center/cover no-repeat;
  text-align: center;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.78);
  }
`;

const HighlightsInner = styled.div`
  position: relative;
  z-index: 1;
`;

const BirdIcon = styled.div`
  font-size: 2.2rem;
  margin-bottom: 10px;
  color: #222222;
`;

const HighlightsTitle = styled.h2`
  font-family: 'Sansation', sans-serif;
  font-size: 2.4rem;
  color: #111111;
  margin-bottom: 50px;
`;

const CardsRow = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 24px;
`;

const HighlightCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 36px 28px;
  width: 220px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
`;

const CardEmoji = styled.span`
  font-size: 2.6rem;
`;

const CardText = styled.p`
  font-size: 0.95rem;
  color: #333333;
  line-height: 1.5;
  text-align: center;
  margin: 0;
`;

/* ── Timeline ── */
const TimelineSection = styled.div`
  padding: 80px 8%;
  max-width: 780px;
  margin: 0 auto;
`;

const TimelineTitle = styled.h2`
  font-family: 'Sansation', sans-serif;
  font-size: 2.4rem;
  color: #111111;
  text-align: center;
  margin-bottom: 60px;
`;

const TimelineList = styled.div`
  position: relative;
  padding-left: 36px;

  &::before {
    content: "";
    position: absolute;
    left: 8px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #cccccc;
  }
`;

const TimelineItem = styled.div`
  position: relative;
  margin-bottom: 0;
`;

const TimelineDot = styled.div`
  position: absolute;
  left: -32px;
  top: 4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid ${(props) => (props.active ? "#4db6e8" : "#aaaaaa")};
  background: ${(props) => (props.active ? "#4db6e8" : "#ffffff")};
  z-index: 1;
`;

const TimelineDate = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: #4db6e8;
  display: block;
  margin-bottom: 4px;
`;

const TimelineEventTitle = styled.h4`
  font-size: 1.05rem;
  font-weight: 700;
  color: #111111;
  margin: 0 0 4px;
`;

const TimelineEventDesc = styled.p`
  font-size: 0.9rem;
  color: #777777;
  margin: 0 0 4px;
`;

const TimelineDivider = styled.hr`
  border: none;
  border-top: 1px solid #e8e8e8;
  margin: 18px 0;
`;

/* ── Bottom CTA ── */
const CTASection = styled.div`
  background: #f5f5f5;
  text-align: center;
  padding: 60px 8%;
`;

const CTAButtons = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 30px;
`;

const CTAButton = styled.a`
  display: inline-block;
  background: #222222;
  color: #ffffff;
  text-decoration: none;
  padding: 16px 40px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.25s, box-shadow 0.25s;
  box-shadow: 0 6px 20px rgba(0,0,0,0.18);

  &:hover {
    background: #000000;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }
`;

const ContactInfo = styled.p`
  text-align: center;
  color: #777777;
  margin-top: 30px;
  font-size: 0.9rem;

  a {
    color: #333333;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

// ─── Timeline Data ────────────────────────────────────────────────────────────

const timelineEvents = [
  {
    date: "Feb 15, 2026",
    title: "Applications Open",
    desc: "Limited spots available.",
    active: true,
  },
  {
    date: "March 10, 2026",
    title: "Applications Close",
    desc: "No late submissions accepted. Keep an eye on your inbox.",
    active: false,
  },
  {
    date: "March 12-16, 2026",
    title: "Interview Offers Sent",
    desc: "Select teams are notified of interview offers.",
    active: false,
  },
  {
    date: "March 17, 2026",
    title: "Finalists Offers Sent",
    desc: "Select teams are notified and invited to SOAR.",
    active: false,
  },
  {
    date: "March 22, 2026",
    title: "SOAR: PITCH DAY",
    desc: "Live pitches, judge Q&A, networking reception, and the $10K startup winner announcement.",
    active: true,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const SOAR = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <NavigationBar />
      <PageWrapper>

        {/* ── Hero ── */}
        <HeroSection>
          <HeroContent>
            <HeroLogoImg src={SoarLogo} alt="SOAR" />
            <HeroSubtitle>Where UBC's boldest ideas take flight.</HeroSubtitle>
            <HeroButton
              href="https://forms.gle/mUd3EHgtAnxCLAS67"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply now
            </HeroButton>
          </HeroContent>
        </HeroSection>

        {/* ── Info Bar ── */}
        <InfoBar>
          <InfoItem>
            <InfoIcon>📅</InfoIcon>
            <InfoLabel>Date &amp; Time</InfoLabel>
            <InfoValue>
              March 22, 2026<br />10:00 AM - 2:00 PM
            </InfoValue>
          </InfoItem>

          <InfoDivider />

          <InfoItem>
            <InfoIcon>📍</InfoIcon>
            <InfoLabel>Location</InfoLabel>
            <InfoValue>
              UBC Sauder School of Business<br />The Big 4 Conference Centre, 9th Floor
            </InfoValue>
          </InfoItem>

          <InfoDivider />

          <InfoItem>
            <InfoIcon>⏰</InfoIcon>
            <InfoLabel>Deadline to Apply</InfoLabel>
            <InfoValue>
              March 15<br />11:59 PM PST
            </InfoValue>
          </InfoItem>
        </InfoBar>

        {/* ── What is SOAR? ── */}
        <WhatSection>
          <WhatText>
            <WhatTitle>What is SOAR?</WhatTitle>
            <WhatDescription>
              SOAR is UBC's largest pitch competition hosted by UBC Startups Club.
              Students across all faculties and experience levels are welcome to apply
              to compete in a pitch competition where the winning startup will receive
              a $10,000 non-dilutive cash prize from Linde Equity.
            </WhatDescription>
          </WhatText>
          <WhatImage src={SoarEventPhoto} alt="SOAR event audience" />
        </WhatSection>

        {/* ── Event Highlights ── */}
        <HighlightsSection>
          <HighlightsInner>
            <BirdIcon>🕊</BirdIcon>
            <HighlightsTitle>Event Highlights</HighlightsTitle>
            <CardsRow>
              <HighlightCard>
                <CardEmoji>💰</CardEmoji>
                <CardText>$10,000 non-dilutive cash prize</CardText>
              </HighlightCard>
              <HighlightCard>
                <CardEmoji>👔</CardEmoji>
                <CardText>Pitch to Canadian VCs &amp; angel investors who will attend live</CardText>
              </HighlightCard>
              <HighlightCard>
                <CardEmoji>🎯</CardEmoji>
                <CardText>Gain feedback, visibility, and real connections in UBC's startup ecosystem</CardText>
              </HighlightCard>
            </CardsRow>
          </HighlightsInner>
        </HighlightsSection>

        {/* ── Timeline ── */}
        <TimelineSection>
          <TimelineTitle>Timeline</TimelineTitle>
          <TimelineList>
            {timelineEvents.map((event, index) => (
              <TimelineItem key={index}>
                <TimelineDot active={event.active} />
                <TimelineDate>{event.date}</TimelineDate>
                <TimelineEventTitle>{event.title}</TimelineEventTitle>
                <TimelineEventDesc>{event.desc}</TimelineEventDesc>
                {index < timelineEvents.length - 1 && <TimelineDivider />}
              </TimelineItem>
            ))}
          </TimelineList>
        </TimelineSection>

        {/* ── Bottom CTA ── */}
        <CTASection>
          <CTAButtons>
            <CTAButton
              href="https://drive.google.com/file/d/1ox9qduuMrkHmXWHRx3b6Jmnmypt65Ra_/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
            >
              SOAR Rules
            </CTAButton>
            <CTAButton
              href="https://forms.gle/mUd3EHgtAnxCLAS67"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply to Pitch
            </CTAButton>
            <CTAButton
              href="https://luma.com/00im0e08"
              target="_blank"
              rel="noopener noreferrer"
            >
              Attend SOAR
            </CTAButton>
          </CTAButtons>
          <ContactInfo>
            Questions? Contact us at{" "}
            <a href="mailto:ubcstartups@gmail.com">ubcstartups@gmail.com</a>
          </ContactInfo>
        </CTASection>

      </PageWrapper>
      <Footer />
    </>
  );
};

export default SOAR;
