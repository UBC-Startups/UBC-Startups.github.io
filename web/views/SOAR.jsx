"use client";

import styles from "./SOAR.module.css";
import { motion, useReducedMotion } from "motion/react";
import NavigationBar from "../components/navigationBar";
const SoarEventPhoto1 = "/images/eventPhotos/soar1.jpg";
const SoarEventPhoto2 = "/images/eventPhotos/soar2.jpg";
const SoarEventPhoto3 = "/images/eventPhotos/soar3.jpg";
const SoarEventPhoto4 = "/images/eventPhotos/soar4.jpg";
const SoarEventPhoto5 = "/images/eventPhotos/soar5.jpg";
import PhotoGallery from "../components/photoGallery";
const SoarLogo = "/images/eventPhotos/Soar Logo.png";
const Seagull = "/images/eventPhotos/seagull2.png";
const LindeImg = "/images/partnerPhotos/linde.jpeg";
const RedBullImg = "/images/partnerPhotos/redBull.png";
const RumbleImg = "/images/partnerPhotos/rumble.png";
const PoppiImg = "/images/partnerPhotos/poppi.png";
const KitsImg = "/images/partnerPhotos/kits.svg";
const AlthraImg = "/images/partnerPhotos/althra1.png";
function MoneyBagIcon() {
  return <img src="/images/svg/moneybag1.svg" alt="" aria-hidden="true" />;
}
function BuildingIcon() {
  return <img src="/images/svg/building.svg" alt="" aria-hidden="true" />;
}
function StarIcon() {
  return <img src="/images/svg/star.svg" alt="" aria-hidden="true" />;
}
function PersonIcon() {
  return <img src="/images/svg/person.svg" alt="" aria-hidden="true" />;
}
const XpressFounder1 = "/images/eventPhotos/xpressfounder1.jpg";
const XpressFounder2 = "/images/eventPhotos/xpressfounder2.png";
const XpressLogo = "/images/eventPhotos/xpressLogo.jpeg"; // ─── Styled Components ────────────────────────────────────────────────────────
/* ── Hero ── */
/* ── Info Bar ── */
/* ── What is SOAR ── */
/* ── Highlights ── */
/* ── Timeline ── */
/* ── Bottom CTA ── */
/* ── Past Winner ── */
/* ── Judges ── */
/* ── Sponsors ── */
// ─── Timeline Data ────────────────────────────────────────────────────────────

const timelineEvents = [{
  date: "Feb 15, 2026",
  title: "Applications Open",
  desc: "Limited spots available.",
  active: true
}, {
  date: "March 10, 2026",
  title: "Applications Close",
  desc: "No late submissions accepted. Keep an eye on your inbox.",
  active: false
}, {
  date: "March 12-16, 2026",
  title: "Interview Offers Sent",
  desc: "Select teams are notified of interview offers.",
  active: false
}, {
  date: "March 17, 2026",
  title: "Finalists Offers Sent",
  desc: "Select teams are notified and invited to SOAR.",
  active: false
}, {
  date: "March 22, 2026",
  title: "SOAR: PITCH DAY",
  desc: "Live pitches, judge Q&A, networking reception, and the $10K startup winner announcement.",
  active: true
}];

// ─── Component ────────────────────────────────────────────────────────────────

const SOAR = ({
  footer
}) => {
  const reduceMotion = useReducedMotion();
  return <>
      <NavigationBar />
      <main id="main-content" className={styles.PageWrapper}>
        <h1 className="sr-only">SOAR 2026</h1>

        {/* ── Hero ── */}
        <div className={styles.HeroSection}>
          <div className={styles.HeroContent}>
            <img src={SoarLogo} alt="SOAR" className={styles.HeroLogoImg} />
            <p className={styles.HeroSubtitle}>Where UBC&apos;s boldest ideas take flight.</p>
            <div className={styles.HeroButtonGroup}>
              <a href="https://forms.gle/mUd3EHgtAnxCLAS67" target="_blank" rel="noopener noreferrer" className={styles.HeroButton}>
                Apply now
              </a>
              <a href="https://luma.com/00im0e08" target="_blank" rel="noopener noreferrer" className={[styles.HeroButton, styles.HeroButtonOutline].join(" ")}>
                Attend SOAR
              </a>
              <a href="https://drive.google.com/file/d/1ox9qduuMrkHmXWHRx3b6Jmnmypt65Ra_/view?usp=sharing" target="_blank" rel="noopener noreferrer" className={[styles.HeroButton, styles.HeroButtonOutline].join(" ")}>
                SOAR Rules
              </a>
            </div>
          </div>
          <motion.button type="button" aria-label="Explore SOAR" animate={{
          y: reduceMotion ? 0 : [0, 10, 0]
        }} transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "easeInOut"
        }} onClick={() => window.scrollBy({
          top: window.innerHeight,
          behavior: reduceMotion ? "auto" : "smooth"
        })} className={styles.HeroArrow}>
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.256 8.606c0-0.269 0.106-0.544 0.313-0.75 0.412-0.412 1.087-0.412 1.5 0l14.119 14.119 13.913-13.912c0.413-0.412 1.087-0.412 1.5 0s0.413 1.088 0 1.5l-14.663 14.669c-0.413 0.413-1.088 0.413-1.5 0l-14.869-14.869c-0.213-0.213-0.313-0.481-0.313-0.756z" />
            </svg>
          </motion.button>
        </div>

        {/* ── Info Bar ── */}
        <div className={styles.InfoBar}>
          <div className={styles.InfoItem}>
            <span className={styles.InfoIcon}>📅</span>
            <span className={styles.InfoLabel}>Date &amp; Time</span>
            <span className={styles.InfoValue}>
              March 22, 2026<br />10:00 AM - 2:00 PM
            </span>
          </div>

          <div className={styles.InfoDivider} />

          <div className={styles.InfoItem}>
            <span className={styles.InfoIcon}>📍</span>
            <span className={styles.InfoLabel}>Location</span>
            <span className={styles.InfoValue}>
              UBC Sauder School of Business<br />The Big 4 Conference Centre, 9th Floor
            </span>
          </div>

          <div className={styles.InfoDivider} />

          <div className={styles.InfoItem}>
            <span className={styles.InfoIcon}>⏰</span>
            <span className={styles.InfoLabel}>Deadline to Apply</span>
            <span className={styles.InfoValue}>
              March 10<br />11:59 PM PST
            </span>
          </div>
        </div>

        {/* ── What is SOAR? ── */}
        <div className={styles.WhatSection}>
          <div className={styles.WhatText}>
            <h2 className={styles.WhatTitle}>What is SOAR?</h2>
            <p className={styles.WhatDescription}>
              SOAR is UBC&apos;s largest pitch competition hosted by UBC Startups Club.
              Students across all faculties and experience levels are welcome to apply
              to compete in a pitch competition where the winning startup will receive
              a $10,000 non-dilutive cash prize from Linde Equity.
            </p>
          </div>
          <div className={styles.WhatGallery}>
            <PhotoGallery images={[{
            original: SoarEventPhoto3
          }, {
            original: SoarEventPhoto4
          }, {
            original: SoarEventPhoto5
          }, {
            original: SoarEventPhoto1
          }, {
            original: SoarEventPhoto2
          }]} />
          </div>
        </div>

        {/* ── Event Highlights ── */}
        <div className={styles.HighlightsSection}>
          <div className={styles.HighlightsInner}>
            <img src={Seagull} alt="seagull" className={styles.BirdIcon} />
            <h2 className={styles.HighlightsTitle}>Event Highlights</h2>
            <div className={styles.CardsRow}>
              <div className={styles.HighlightCard}>
                <div className={styles.CardIcon}><MoneyBagIcon /></div>
                <p className={styles.CardText}>$10,000 non-dilutive cash prize</p>
              </div>
              <div className={styles.HighlightCard}>
                <div className={styles.CardIcon}><BuildingIcon /></div>
                <p className={styles.CardText}>Pitch to Canadian VCs &amp; angel investors who will attend live</p>
              </div>
              <div className={styles.HighlightCard}>
                <div className={styles.CardIcon}><StarIcon /></div>
                <p className={styles.CardText}>Gain feedback, visibility, and real connections in UBC&apos;s startup ecosystem</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Timeline ── */}
        <div className={styles.TimelineSection}>
          <h2 className={styles.TimelineTitle}>Timeline</h2>
          <div className={styles.TimelineList}>
            {timelineEvents.map((event, index) => <div key={index} className={styles.TimelineItem}>
                <div className={styles.TimelineDot} style={{
              "--timelinedot-0": event.active ? "#4db6e8" : "#aaaaaa",
              "--timelinedot-1": event.active ? "#4db6e8" : "#ffffff"
            }} />
                <span className={styles.TimelineDate}>{event.date}</span>
                <h4 className={styles.TimelineEventTitle}>{event.title}</h4>
                <p className={styles.TimelineEventDesc}>{event.desc}</p>
                {index < timelineEvents.length - 1 && <hr className={styles.TimelineDivider} />}
              </div>)}
          </div>
        </div>

        {/* ── Past Winner ── */}
        <div className={styles.PastWinnerSection}>
          <h2 className={styles.PeopleSectionTitle}>Past Winner</h2>
          <div className={styles.PastWinnerCard}>
            <img src={XpressLogo} alt="Xpress Select" className={styles.WinnerLogoImg} />
            <div className={styles.WinnerDivider} />
            <div className={styles.WinnerFounders}>
              <div className={styles.WinnerFounderCard}>
                <img src={XpressFounder1} alt="Hasti Haghdadi" className={styles.WinnerFounderPhoto} />
                <p className={styles.WinnerFounderName}>Hasti Haghdadi</p>
                <p className={styles.WinnerFounderRole}>Co-founder & COO</p>
              </div>
              <div className={styles.WinnerFounderCard}>
                <img src={XpressFounder2} alt="Hana Rahili" className={styles.WinnerFounderPhoto} />
                <p className={styles.WinnerFounderName}>Hana Rahili</p>
                <p className={styles.WinnerFounderRole}>Co-founder & CEO</p>
              </div>
            </div>
            <div>
              <p className={styles.WinnerLabel}>SOAR 2025 Winner</p>
              <h3 className={styles.WinnerName}>Xpress Select</h3>
              <p className={styles.WinnerDesc}>
                Xpress Select is a digital platform that optimizes pharmacy operations by streamlining
                OTC recommendations and pharmacist-led minor ailment services. Patients complete structured
                clinical assessments in-store or online, while the software automates intake, documentation,
                and routing—reducing wait times and freeing pharmacists to focus on higher-value care.
              </p>
            </div>
          </div>
        </div>

        {/* ── Judges ── */}
        <div className={styles.PeopleSection}>
          <h2 className={styles.PeopleSectionTitle}>Judges</h2>
          <div className={styles.JudgesGrid}>
            <div className={styles.JudgeCard}>
              <div className={styles.JudgeAvatar}><PersonIcon /></div>
              <p className={styles.JudgeName}>TBA</p>
              <p className={styles.JudgeRole}>Venture Capitalist</p>
            </div>
            <div className={styles.JudgeCard}>
              <div className={styles.JudgeAvatar}><PersonIcon /></div>
              <p className={styles.JudgeName}>TBA</p>
              <p className={styles.JudgeRole}>Angel Investor</p>
            </div>
            <div className={styles.JudgeCard}>
              <div className={styles.JudgeAvatar}><PersonIcon /></div>
              <p className={styles.JudgeName}>TBA</p>
              <p className={styles.JudgeRole}>Industry Expert</p>
            </div>
          </div>
          <div className={styles.ComingSoonBadge}>Judges announced soon</div>
        </div>

        {/* ── Sponsors ── */}
        <div className={styles.SponsorsSection}>
          <h2 className={styles.PeopleSectionTitle}>Our Sponsors</h2>
          <div className={styles.SponsorsGrid}>
            <img src={LindeImg} alt="Linde Equity" className={styles.SponsorLogo} />
            <img src={RedBullImg} alt="Red Bull" className={styles.SponsorLogo} />
            <img src={RumbleImg} alt="Rumble" className={styles.SponsorLogo} />
            <img src={PoppiImg} alt="Poppi" className={styles.SponsorLogo} />
            <img src={KitsImg} alt="Kits" className={styles.SponsorLogo} />
            <img src={AlthraImg} alt="Althra" className={styles.SponsorLogo} />
          </div>
          <div style={{
          marginTop: "30px"
        }} className={styles.ComingSoonBadge}>More sponsors to be announced</div>
        </div>

        {/* ── Bottom CTA ── */}
        <div className={styles.CTASection}>
          <div className={styles.CTAButtons}>
            <a href="https://drive.google.com/file/d/1ox9qduuMrkHmXWHRx3b6Jmnmypt65Ra_/view?usp=sharing" target="_blank" rel="noopener noreferrer" className={styles.CTAButton}>
              SOAR Rules
            </a>
            <a href="https://forms.gle/mUd3EHgtAnxCLAS67" target="_blank" rel="noopener noreferrer" className={styles.CTAButton}>
              Apply to Pitch
            </a>
            <a href="https://luma.com/00im0e08" target="_blank" rel="noopener noreferrer" className={styles.CTAButton}>
              Attend SOAR
            </a>
          </div>
          <p className={styles.ContactInfo}>
            Questions? Contact us at{" "}
            <a href="mailto:ubcstartups@gmail.com">ubcstartups@gmail.com</a>
          </p>
        </div>

      </main>
      {footer}
    </>;
};
export default SOAR;
