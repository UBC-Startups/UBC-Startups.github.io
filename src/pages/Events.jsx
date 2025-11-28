import React, { useState } from "react";
import styled from "styled-components";
import EventBox from "../components/event";
import NavigationBar from "../components/navigationBar";
import Footer from "../sections/footer";
import shapeDesign from "../images/HeroShapeDesign.svg";

// Images for events
import AboutImage2 from "../images/AboutImage2.jpg"; // Placeholder
import AboutImage1 from "../images/AboutImage1.jpg"; // Placeholder
import TwentyFiveBrunchImg from "../images/eventPhotos/25under25.jpg";
import FSAISAAS from "../images/eventPhotos/founderSpotlightAISaaS.png";
import HIMMIImage from "../images/eventPhotos/himmi.png";
import GtwImage from "../images/eventPhotos/gainingTractionImg.jpg";
import PrototypingWImage from "../images/eventPhotos/prototypingWorkshopImg.jpg";
import PitchWImage from "../images/eventPhotos/pitchWorkshopImg.png";
import SoarImage from "../images/eventPhotos/soarImage.png";
import liftoff from "../images/eventPhotos/liftoff_events.jpg";
import crisisRoom from "../images/eventPhotos/event_poster.png";

const Container = styled.div`
    overflow-x: hidden;
    position: relative;
    padding-top: 150px;
`;

const Title = styled.h1`
    text-align: center;
    font-size: 3em;
    padding-bottom: 30px;
    font-family: 'Sansation', sans-serif;
`;

const FilterOptions = styled.ul`
    padding: 0;
    margin: 30px 0;
    text-align: center;
    padding-bottom: 20px;
`;

const FilterButton = styled.li`
    display: inline-block;
    text-transform: uppercase;
    color: #656464;
    padding: 10px 5px;
    width: 150px;
    text-align: center;
    background: ${(props) => (props.active ? "#333333" : "#F1F3F5")};
    color: ${(props) => (props.active ? "#FFFFFF" : "#495057")};
    border: ${(props) => (props.active ? "1px solid #333333" : "1px solid #E0E0E0")};
    border-radius: 30px;
    box-shadow: ${(props) => (props.active ? "0px 10px 10px rgba(0, 0, 0, 0.35)" : "0px 4px 4px rgba(0, 0, 0, 0.35)")} ;
    display: inline-block;
    margin: 0px 20px 20px 20px;
    cursor: pointer;
    z-index: 2;
    transition: 0.4s;
    font-weight: semi-bold;
    transition: 0.3s;
    
    &:hover {
        transform: ${(props) => (props.active ? "none" : "scale(1.05)")};
    }
`;

const EventsGrid = styled.div`
    margin: 0 auto;
    display: grid;
    grid-gap: 50px;
    justify-items: center;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    margin-top: 50px;
    padding: 0 25px;
    padding-bottom: 100px;

    @media (max-width: 768px) {
        padding: 0;
    }
`;

const BackgroundWrapper = styled.div`
    position: absolute;
    left: 0;
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

const Events = () => {
    const [category, setCategory] = useState("all");

    const events = [
        {
            img: crisisRoom,
            title: "Crisis Room (2025W)",
            description:
                "Join us for the Crisis Room Challenge — a fast-paced event where teams act as startup leaders navigating back-to-back crises in the tech industry. This event is a Model UN-style competition which will challenge your skills in analyzing scenarios, innovating rapid solutions, and pitching your strategies to a panel of industry professionals.",
            month: "Nov",
            day: "24",
            year: 2025,
            category: "prev",
            imgTop: "-100px",
            posterLink: "/event-poster/innovation-olympics-2025",
        },
        {
            img: SoarImage,
            title: "SOAR (2026W)",
            description:
                "SOAR is the university's largest pitch competition with a $10,000 prize pool! Student founders pitch their ideas to investors and industry leaders, receive feedback, and compete for funding. With networking, lunch, and a full day of presentations, SOAR is the perfect way to be inspired and support the next wave of UBC entrepreneurs.",
            month: "March",
            day: "21",
            year: 2026,
            category: "upcoming",
            imgTop: "-20px",
        },
        {
            img: AboutImage1,
            title: "Found(Her)'s Brunch  (2026W)",
            description:
                "Celebrate International Women's Day with Found(Her)'s Brunch, featuring talks, Q&A, and networking with successful women founders and leaders. Connect, be inspired, and engage in conversations about entrepreneurship and empowerment.",
            month: "March",
            day: "8",
            year: 2026,
            category: "upcoming",
            imgTop: "-100px",
        },
        {
            img: liftoff,
            title: "Lift-Off and Welcome Event (2025W)",
            description:
                "UBC Startups is kicking off the year with a high-energy welcome event featuring an interactive investing game with industry professionals. Enjoy snacks, networking, and stories from past founders while getting a sneak peek at upcoming opportunities.",
            month: "Oct",
            day: "17",
            year: 2025,
            category: "prev",
            imgTop: "-100px",
        },
        {
            img: FSAISAAS,
            title: "InnoVision (2024W)",
            description:
                "InnoVision will be our 2nd event of the year, where future entrepreneurs have the opportunity to network and connect with entrepreneurs from and outside of UBC. After the panel, there will be a group activity to ideate a product and pitch it to the panel, followed by open networking!",
            month: "Nov",
            day: "4",
            year: 2024,
            category: "prev",
            imgTop: "-100px",
        },
        {
            img: AboutImage1,
            title: "Founders Spotlight (2024W)",
            description:
                "There will be a diverse panel who have founded their own successful startups speak about their journey and you will have the opportunity to ask them about their experiences or any other questions about the industry. At the end, there is a open networking session!",
            month: "Sept",
            day: "24",
            year: 2024,
            category: "prev",
            imgTop: "-100px",
        },
        {
            img: SoarImage,
            title: "SOAR (2023W)",
            description:
                "UBC Startups in partnership with the CSSS are thrilled to announce the first iteration of the SOAR Startup Pitch Competition, a premier event designed to showcase the entrepreneurial talent and innovative ideas within the UBC community. There will be a $10,000 non-dilutive cash prize!",
            month: "Mar",
            day: "23",
            year: 2023,
            category: "prev",
            imgTop: "-20px",
        },
        {
            img: PitchWImage,
            title: "Workshop 3: Pitch Perfect (2023W)",
            description:
                "Pitch perfect, organized by UBC Startups in collaboration with the CSSS will prepare students for SOAR. It's part of a series aimed at equipping student founders with essential skills for success in the startup landscape, focusing on pitching products effectively",
            month: "Mar",
            day: "11",
            year: 2023,
            category: "prev",
        },
        {
            img: GtwImage,
            title: "Workshop 2: Gaining Traction (2023W)",
            description:
                "A workshop hosted in collaboration with the CSSS, targets students preparing for SOAR. As part of a series of workshops, it aims to equip future student founders with skills crucial for success in the startup scene, focusing on gaining traction for their products through insights and interactive learning opportunities.",
            month: "Feb",
            day: "8",
            year: 2023,
            category: "prev",
            imgTop: "-120px",
        },
        {
            img: PrototypingWImage,
            title: "Workshop 1: Prototyping & Product Design (2023W)",
            description:
                "This workshop provided insights and interactive learning opportunities from both a designer's and a developer's perspective, designed to cultivate a deep understanding of product design and prototyping – skills essential for success in the competitive startup landscape.",
            month: "Jan",
            day: "24",
            year: 2023,
            category: "prev",
        },
        {
            img: FSAISAAS,
            title: "Founder Spotlight: AI/SaaS (2023W)",
            description:
                "A networking event in partnership with the Computer Science Student Society (CSSS). Provided students with a chance to connect with AI and SaaS industry leaders, fostering a sense of community among budding entrepreneurs.",
            month: "Sept",
            day: "19",
            year: 2023,
            category: "prev",
        },
        {
            img: HIMMIImage,
            title: "How I met my Intern (2022W)",
            description:
                "An event that aims to provide opportunities for entrepreneurial students at UBC to meet Vancouver-based startups that are hiring for internships. Startups that attend this event will be hiring interns exclusively from UBC, so this is an invaluable opportunity for students to make lasting impressions on hiring managers.",
            month: "Mar",
            day: "24",
            year: 2022,
            category: "prev",
        },
        {
            img: TwentyFiveBrunchImg,
            title: "25 Under 25 Brunch (2022W)",
            description:
                "A brunch hosted by UBC Startups, Dyne, and eHub where successful entrepreneurs were invited to network with one another. Students at the event also got the opportunity to network with existing entrepreneurs and to gain insight from them, and one another.",
            month: "Nov",
            day: "26",
            year: 2022,
            category: "prev",
        },
        {
            img: AboutImage2,
            title: "How I Met Your Founder (2022W)",
            description:
                "‘How I Met Your Founder’, sponsored by Contrary Capital, was an opportunity for students from different faculties to get advice from experienced entrepreneurs, and develop a sense of camaraderie as aspiring entrepreneurs.",
            month: "Sept",
            day: "26",
            year: 2022,
            category: "prev",
        },
    ];

    const monthMap = {
        Sept: 0,
        Oct: 1,
        Nov: 2,
        Dec: 3,
        Jan: 4,
        Feb: 5,
        Mar: 6,
        Apr: 7,
        May: 8,
        Jun: 9,
        Jul: 10,
        Aug: 11,
        September: 0,
        October: 1,
        November: 2,
        December: 3,
        January: 4,
        February: 5,
        March: 6,
        April: 7,
        June: 9,
        July: 10,
        August: 11,
    };

    const sortedEvents = events
        .filter((e) => category === "all" || e.category === category)
        .sort((a, b) => {
            if (category === "upcoming") {
                const dateA = new Date(a.year, monthMap[a.month], parseInt(a.day), 0, 0);
                const dateB = new Date(b.year, monthMap[b.month], parseInt(b.day), 0, 0);
                return dateA - dateB;
            }
            return 0;
        });

    return (
        <div style={{ position: "relative", minHeight: "100%" }}>
            <BackgroundWrapper />

            <Container>
                <NavigationBar />
                <Title>Our Events</Title>

                <FilterOptions>
                    <FilterButton
                        active={category === "all"}
                        onClick={() => setCategory("all")}
                    >
                        All Events
                    </FilterButton>
                    <FilterButton
                        active={category === "upcoming"}
                        onClick={() => setCategory("upcoming")}
                    >
                        Upcoming
                    </FilterButton>
                    <FilterButton
                        active={category === "prev"}
                        onClick={() => setCategory("prev")}
                    >
                        Previous
                    </FilterButton>
                </FilterOptions>

                <EventsGrid>
                    {sortedEvents.map((event, i) => (
                        <EventBox
                            key={i}
                            img={event.img}
                            title={event.title}
                            description={event.description}
                            month={event.month}
                            day={event.day}
                            category={event.category}
                            posterLink={event.posterLink}
                        />
                    ))}
                </EventsGrid>

                <Footer />
            </Container>
        </div>
    );
};

export default Events;
