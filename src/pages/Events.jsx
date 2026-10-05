import React from "react";
import styled from "styled-components";

import Layout from "../home/Layout";
import PageHero from "../home/sections/PageHero";
import { bp } from "../home/theme";
import EventCard from "../components/eventCard";

import foundersCircleImg from "../images/eventPhotos/founders_circle_poster.jpeg";
import pitchPropelImg from "../images/eventPhotos/pitch-propel-cover.jpg";
import caseHackImg from "../images/eventPhotos/liftoff_activity.jpg";
import launchLinkImg from "../images/eventPhotos/liftoff_events.jpg";
import capitalConnectImg from "../images/eventPhotos/gainingTractionImg.jpg";
import soarImg from "../images/eventPhotos/soar-recap-cover.png";

const Term = styled.section`
    display: flex;
    flex-direction: column;
    gap: 48px;
    padding: 80px 16px 0;

    &:last-of-type {
        padding-bottom: 60px;
    }

    ${bp.sm} {
        padding: 120px 32px 0;
    }
`;

const TermHeader = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
`;

const TermTitle = styled.p`
    flex: 1 0 0;
    margin: 0;
    font-weight: 600;
    font-size: clamp(36px, 5vw, 64px);
    line-height: 1;
    letter-spacing: -2.56px;
    color: #0a0a0a;
`;

const TermDates = styled.p`
    margin: 0;
    font-size: 15px;
    color: #6b6b6b;
    white-space: nowrap;
`;

const EventList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const EventAnchor = styled.div`
    scroll-margin-top: 90px;
`;

const events = [
    {
        term: "Term 1",
        slug: "founders-circle",
        number: "01",
        title: "Founder's Circle",
        description:
            "Founder’s Circle UBC is UBC Startups' kickoff networking event for the year. It brings together students, founders, alumni, faculty, and members of the UBC entrepreneurship community to meet, exchange ideas, and build new connections. The event is designed to be casual and welcoming, making it easy for students at any stage of their entrepreneurial journey to get involved, while connecting attendees with entrepreneurship resources and partner organizations across campus and introducing UBC Startups' upcoming events and initiatives.",
        date: "Sep 24",
        year: 2026,
        gradientFrom: "#dd3322",
        gradientTo: "#000000",
        duration: "2 hours",
        expected: "60–70 attendees",
        format: "Networking mixer with icebreakers and conversation prompts",
        venue: "Open event space with standing tables and seating",
        whoFor: "Students interested in entrepreneurship, founders, alumni, faculty, and campus entrepreneurship organizations.",
        status: "past",
        extraTags: ["Past event"],
        detailsLink: "https://luma.com/r54t2zy9",
        photos: [],
        image: foundersCircleImg,
    },
    {
        term: "Term 1",
        slug: "pitch-propel",
        number: "02",
        title: "Pitch & Propel",
        description:
            "Pitch & Propel is a two-part event that helps students develop and present startup ideas. It begins with a short workshop covering startup fundamentals, pitching, and idea validation, followed by elevator-style pitches where participants present either their own idea or respond to a prompt. The focus is on building confidence, improving communication skills, and giving participants practical feedback from founders, mentors, and peers in a supportive environment.",
        highlight:
            "The elevator pitch: step into our mock elevator, complete with sound effects and floor numbers counting down. You get 60–90 seconds, about the length of an elevator ride, to pitch your own idea or one from a prompt. Mentors give 1–2 minutes of live feedback before the next ride.",
        date: "Oct 29",
        year: 2026,
        gradientFrom: "#ff5a1f",
        gradientTo: "#1a1a1a",
        duration: "2.5–3 hours",
        expected: "80–90 attendees",
        format: "Workshop, pitch prep, elevator pitches, feedback, networking",
        whoFor: "Students interested in startups, first-time founders, and anyone looking to improve their pitching skills.",
        status: "next",
        image: pitchPropelImg,
    },
    {
        term: "Term 1",
        slug: "casehack",
        number: "03",
        title: "CaseHack",
        description:
            "CaseHack is UBC Startups' flagship innovation competition. Students from business, computer science, engineering, and design work in interdisciplinary teams to solve a real-world challenge by developing both a business solution and a prototype. Teams receive mentorship throughout the event before presenting their final pitch and demo to a panel of judges, with the event designed to help students meet collaborators with complementary skill sets and build connections that can continue beyond the event.",
        date: "Nov 27–28",
        year: 2026,
        gradientFrom: "#88dcbe",
        gradientTo: "#1a1a1a",
        duration: "One day or weekend",
        expected: "90–120 attendees (16–20 teams)",
        format: "Challenge reveal, team formation, mentorship, prototyping, final pitches, awards",
        whoFor: "Business, Computer Science, Engineering, and Design students interested in startups, innovation, and product development.",
        status: "default",
        extraTags: ["Flagship", "New"],
        image: caseHackImg,
    },
    {
        term: "Term 2",
        slug: "launchlink",
        number: "04",
        title: "LaunchLink",
        description:
            "LaunchLink is a career-focused networking event that connects students with startups, scale-ups, and local businesses looking for emerging talent. Unlike a traditional career fair, the focus is on meaningful conversations, learning about startup careers, and exploring internship, co-op, and full-time opportunities. Companies share what they do and their company culture, giving students insight into working in startup environments and helping them build professional relationships with founders and hiring teams.",
        date: "Jan 14",
        year: 2027,
        gradientFrom: "#dd3322",
        gradientTo: "#000000",
        duration: "2–3 hours",
        expected: "60–80 attendees",
        format: "Opening remarks, company intros, open networking, career advice stations",
        venue: "Large networking space",
        whoFor: "Students seeking internships, co-op, or full-time opportunities in startups and innovation-focused companies.",
        status: "default",
        image: launchLinkImg,
    },
    {
        term: "Term 2",
        slug: "capital-connect",
        number: "05",
        title: "Capital Connect",
        description:
            "Capital Connect is a networking event that brings together venture capitalists, angel investors, founders, and students interested in entrepreneurship. The goal is to make funding and investing more approachable while helping students build relationships with people in Vancouver's startup ecosystem. The event begins with a short networking activity to encourage conversation before transitioning into open networking, where investors and founders share insights on fundraising, venture capital, and startup growth.",
        date: "Feb 25",
        year: 2027,
        gradientFrom: "#ff5a1f",
        gradientTo: "#1a1a1a",
        duration: "2–2.5 hours",
        expected: "50–60 attendees",
        format: "Icebreaker game, panel or fireside chat, open networking",
        venue: "Open networking venue with standing tables",
        whoFor: "Students interested in startups, venture capital, investing, and entrepreneurship, plus founders looking to grow their network.",
        status: "default",
        image: capitalConnectImg,
    },
    {
        term: "Term 2",
        slug: "soar",
        number: "06",
        title: "SOAR",
        description:
            "SOAR is UBC Startups' flagship annual pitch competition, bringing together the university's top student founders to showcase their ventures in front of investors, founders, and industry leaders. Finalist teams present their startups through live pitches followed by a Q&A with judges. Throughout the day, attendees can network with founders, investors, sponsors, and members of the entrepreneurial community while competing for prizes, funding, and exposure within Vancouver's startup ecosystem.",
        date: "Mar 21",
        year: 2027,
        gradientFrom: "#88dcbe",
        gradientTo: "#1a1a1a",
        duration: "Full day",
        expected: "100–120 attendees",
        format: "Opening ceremony, pitch sessions, judge Q&A, networking breaks, awards ceremony",
        venue: "Auditorium or large event venue",
        whoFor: "Student founders, aspiring entrepreneurs, investors, industry professionals, alumni, faculty, and the broader startup ecosystem.",
        status: "default",
        signUpLink: "/event-poster/soar-2026",
        extraTags: ["Flagship"],
        image: soarImg,
    },
];

const Events = () => {
    const term1Events = events.filter((e) => e.term === "Term 1");
    const term2Events = events.filter((e) => e.term === "Term 2");

    return (
        <Layout title="Events | UBC Startups" active="Events" footerTitle="Stay in the loop.">
            <PageHero
                eyebrow="Events 2026–27"
                title="Events"
                subtitle="Six events across two terms, from our September kickoff to SOAR in March"
            />

            <Term>
                <TermHeader>
                    <TermTitle>Term 1</TermTitle>
                    <TermDates>September to November 2026</TermDates>
                </TermHeader>
                <EventList>
                    {term1Events.map((event) => (
                        <EventAnchor id={event.slug} key={event.title}>
                            <EventCard termTag={event.term} {...event} />
                        </EventAnchor>
                    ))}
                </EventList>
            </Term>

            <Term>
                <TermHeader>
                    <TermTitle>Term 2</TermTitle>
                    <TermDates>January to March 2027</TermDates>
                </TermHeader>
                <EventList>
                    {term2Events.map((event) => (
                        <EventAnchor id={event.slug} key={event.title}>
                            <EventCard termTag={event.term} {...event} />
                        </EventAnchor>
                    ))}
                </EventList>
            </Term>
        </Layout>
    );
};

export default Events;
