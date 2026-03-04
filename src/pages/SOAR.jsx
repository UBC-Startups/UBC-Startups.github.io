import React, { useEffect } from "react";
import styled from "styled-components";
import { motion } from "motion/react";
import NavigationBar from "../components/navigationBar";
import Footer from "../sections/footer";
import SoarEventPhoto1 from "../images/eventPhotos/soar1.jpg";
import SoarEventPhoto2 from "../images/eventPhotos/soar2.jpg";
import SoarEventPhoto3 from "../images/eventPhotos/soar3.jpg";
import SoarEventPhoto4 from "../images/eventPhotos/soar4.jpg";
import SoarEventPhoto5 from "../images/eventPhotos/soar5.jpg";
import PhotoGallery from "../components/photoGallery";
import Skyscraper from "../images/skyscraper.png";
import SoarLogo from "../images/eventPhotos/Soar Logo.png";
import Clouds from "../images/clouds.jpg";
import Seagull from "../images/eventPhotos/seagull2.png";
import LindeImg from "../images/partnerPhotos/linde.jpeg";
import RedBullImg from "../images/partnerPhotos/redBull.png";
import RumbleImg from "../images/partnerPhotos/rumble.png";
import PoppiImg from "../images/partnerPhotos/poppi.png";
import { ReactComponent as MoneyBagIcon } from "../images/svg/moneybag1.svg";
import { ReactComponent as BuildingIcon } from "../images/svg/building.svg";
import { ReactComponent as StarIcon } from "../images/svg/star.svg";
import { ReactComponent as PersonIcon } from "../images/svg/person.svg";
import shapeDesign from "../images/HeroShapeDesign.svg";
import XpressFounder1 from "../images/eventPhotos/xpressfounder1.jpg";
import XpressFounder2 from "../images/eventPhotos/xpressfounder2.png";
import XpressLogo from "../images/eventPhotos/xpressLogo.jpeg";
// ─── Styled Components ────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  position: relative;
  min-height: 100%;
  overflow-x: hidden;
`;

const BackgroundWrapper = styled.div`
  position: absolute;
  top: -200px;
  width: 100%;
  min-height: 100%;
  z-index: -1;
  pointer-events: none;
  background-image: url(${shapeDesign});
  background-size: 100%;

  @media (max-width: 768px) {
    top: -100px;
    background-size: 300%;
  }
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

  @media (max-width: 768px) {
    align-items: center;
  }

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
  padding: 0 8%;

  @media (max-width: 768px) {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const HeroArrow = styled(motion.div)`
  position: absolute;
  bottom: 36px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 1;
  cursor: pointer;

  svg {
    width: 32px;
    height: 32px;
    fill: #ffffff;
    opacity: 0.85;
  }
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
  color: #555555;
  line-height: 1.8;
`;

const WhatGallery = styled.div`
  flex: 1.5;
  min-width: 0;
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

const BirdIcon = styled.img`
  width: 160px;
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

const CardIcon = styled.div`
  width: 48px;
  height: 48px;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const CardText = styled.p`
  font-size: 0.95rem;
  color: #333333;
  line-height: 1.5;
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
    left: 14px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #cccccc;
  }
`;

const TimelineItem = styled.div`
  position: relative;
`;

const TimelineDot = styled.div`
  position: absolute;
  left: -32px;
  top: 50%;
  transform: translateY(-50%);
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

/* ── Past Winner ── */
const PastWinnerSection = styled.div`
  padding: 80px 8%;
  text-align: center;
`;

const PastWinnerCard = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 56px;
  background: #ffffff;
  border: 1.5px solid #e0e0e0;
  border-radius: 28px;
  padding: 52px 64px;
  margin-top: 40px;
  box-shadow: 0 8px 36px rgba(0,0,0,0.08);
  text-align: left;
  max-width: 900px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 36px 28px;
    gap: 28px;
  }
`;

const WinnerLogoImg = styled.img`
  height: 100px;
  object-fit: contain;
  flex-shrink: 0;
`;

const WinnerDivider = styled.div`
  width: 1px;
  height: 100px;
  background: #e0e0e0;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 80px;
    height: 1px;
  }
`;

const WinnerFounders = styled.div`
  display: flex;
  gap: 16px;
  flex-shrink: 0;
`;

const WinnerFounderPhoto = styled.img`
  width: 130px;
  height: 160px;
  border-radius: 16px;
  object-fit: cover;
  border: 2px solid #e0e0e0;
`;

const WinnerName = styled.h3`
  font-family: 'Sansation', sans-serif;
  font-size: 1.6rem;
  color: #111111;
  margin: 0 0 8px;
`;

const WinnerLabel = styled.p`
  font-size: 0.9rem;
  color: #4db6e8;
  font-weight: 600;
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const WinnerDesc = styled.p`
  font-size: 0.95rem;
  color: #555555;
  line-height: 1.6;
  margin: 0;
`;

/* ── Judges ── */
const PeopleSection = styled.div`
  padding: 80px 8%;
  text-align: center;
`;

const PeopleSectionTitle = styled.h2`
  font-family: 'Sansation', sans-serif;
  font-size: 2.4rem;
  color: #111111;
  margin-bottom: 50px;
`;

const JudgesGrid = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 36px;
`;

const JudgeCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 160px;
`;

const JudgeAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  svg {
    width: 54px;
    height: 54px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const JudgeName = styled.p`
  font-weight: 700;
  font-size: 0.95rem;
  color: #111111;
  margin: 0;
`;

const JudgeRole = styled.p`
  font-size: 0.85rem;
  color: #777777;
  margin: 0;
  line-height: 1.4;
`;

const ComingSoonBadge = styled.div`
  display: inline-block;
  background: #f0f0f0;
  color: #888888;
  font-size: 0.8rem;
  padding: 6px 18px;
  border-radius: 20px;
  margin-top: 10px;
`;

/* ── Sponsors ── */
const SponsorsSection = styled.div`
  padding: 70px 8%;
  text-align: center;
`;

const SponsorsGrid = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 40px;
  margin-top: 40px;
`;

const SponsorLogo = styled.img`
  height: 60px;
  object-fit: contain;
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
        <BackgroundWrapper />

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
          <HeroArrow
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
          >
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.256 8.606c0-0.269 0.106-0.544 0.313-0.75 0.412-0.412 1.087-0.412 1.5 0l14.119 14.119 13.913-13.912c0.413-0.412 1.087-0.412 1.5 0s0.413 1.088 0 1.5l-14.663 14.669c-0.413 0.413-1.088 0.413-1.5 0l-14.869-14.869c-0.213-0.213-0.313-0.481-0.313-0.756z" />
            </svg>
          </HeroArrow>
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
          <WhatGallery>
            <PhotoGallery images={[
              { original: SoarEventPhoto3},
              { original: SoarEventPhoto4},
              { original: SoarEventPhoto5},
              { original: SoarEventPhoto1},
              { original: SoarEventPhoto2},
            ]} />
          </WhatGallery>
        </WhatSection>

        {/* ── Event Highlights ── */}
        <HighlightsSection>
          <HighlightsInner>
            <BirdIcon src={Seagull} alt="seagull" />
            <HighlightsTitle>Event Highlights</HighlightsTitle>
            <CardsRow>
              <HighlightCard>
                <CardIcon><MoneyBagIcon /></CardIcon>
                <CardText>$10,000 non-dilutive cash prize</CardText>
              </HighlightCard>
              <HighlightCard>
                <CardIcon><BuildingIcon /></CardIcon>
                <CardText>Pitch to Canadian VCs &amp; angel investors who will attend live</CardText>
              </HighlightCard>
              <HighlightCard>
                <CardIcon><StarIcon /></CardIcon>
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

        {/* ── Past Winner ── */}
        <PastWinnerSection>
          <PeopleSectionTitle>Past Winner</PeopleSectionTitle>
          <PastWinnerCard>
            <WinnerLogoImg src={XpressLogo} alt="Xpress Select" />
            <WinnerDivider />
            <WinnerFounders>
              <WinnerFounderPhoto src={XpressFounder1} alt="Xpress Select founder" />
              <WinnerFounderPhoto src={XpressFounder2} alt="Xpress Select founder" />
            </WinnerFounders>
            <div>
              <WinnerLabel>SOAR 2025 Winner</WinnerLabel>
              <WinnerName>Xpress Select</WinnerName>
              <WinnerDesc>
                Xpress Select is a digital platform that optimizes pharmacy operations by streamlining
                OTC recommendations and pharmacist-led minor ailment services. Patients complete structured
                clinical assessments in-store or online, while the software automates intake, documentation,
                and routing—reducing wait times and freeing pharmacists to focus on higher-value care.
              </WinnerDesc>
            </div>
          </PastWinnerCard>
        </PastWinnerSection>

        {/* ── Judges ── */}
        <PeopleSection>
          <PeopleSectionTitle>Judges</PeopleSectionTitle>
          <JudgesGrid>
            <JudgeCard>
              <JudgeAvatar><PersonIcon /></JudgeAvatar>
              <JudgeName>TBA</JudgeName>
              <JudgeRole>Venture Capitalist</JudgeRole>
            </JudgeCard>
            <JudgeCard>
              <JudgeAvatar><PersonIcon /></JudgeAvatar>
              <JudgeName>TBA</JudgeName>
              <JudgeRole>Angel Investor</JudgeRole>
            </JudgeCard>
            <JudgeCard>
              <JudgeAvatar><PersonIcon /></JudgeAvatar>
              <JudgeName>TBA</JudgeName>
              <JudgeRole>Industry Expert</JudgeRole>
            </JudgeCard>
          </JudgesGrid>
          <ComingSoonBadge>Judges announced soon</ComingSoonBadge>
        </PeopleSection>

        {/* ── Sponsors ── */}
        <SponsorsSection>
          <PeopleSectionTitle>Our Sponsors</PeopleSectionTitle>
          <SponsorsGrid>
            <SponsorLogo src={LindeImg} alt="Linde Equity" />
            <SponsorLogo src={RedBullImg} alt="Red Bull" />
            <SponsorLogo src={RumbleImg} alt="Rumble" />
            <SponsorLogo src={PoppiImg} alt="Poppi" />
          </SponsorsGrid>
          <ComingSoonBadge style={{ marginTop: "30px" }}>More sponsors to be announced</ComingSoonBadge>
        </SponsorsSection>

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
