import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import NavigationBar from "../components/navigationBar";
import Footer from "../sections/footer";

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
  background-image: ${(props) => `url(${props.src})`};
  background-position: ${(props) => props.$imagePosition || "center"};
  background-size: cover;
  background-repeat: no-repeat;
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

// Event data - you can customize these for your specific events
const eventData = {
    "diagram-ventures-2026": {
        title: "Intern Info Session: Diagram Ventures | UBC Startups",
        date: "October 15, 2026",
        time: "4:00 PM",
        location: "Virtual",
        image: require("../images/eventPhotos/DIagramVenture.avif"),
        description: "Diagram is looking for its Summer 2027 intern class in Toronto or Montreal to help de-risk startup ideas across its venture builder and venture investor teams. And they're coming to you first. UBC students are invited to connect with the Diagram team on Thursday, October 15th at 4:00 PM for a virtual info session. Ask questions, get the inside scoop, hear how they think about venture, learn how to approach the application, and put a face to the name. About Diagram Ventures: Since 2016, Diagram has raised over $480M and has launched/invested in 40+ companies. Our ecosystem is home to 200+ angel investors and an extended global network of corporate partners, investors, and builders. Diagram is part of Sagard, a global multi-strategy alternative investment platform with over US$46B in AUM. About UBC Startups: UBC Startups is a student led club dedicated to supporting and fostering entrepreneurship within the UBC community. Our mission is to equip students, alumni, and faculty with the resources, network, and support needed to turn innovative ideas into successful ventures. With a strong focus on interdisciplinary collaboration, we bring together individuals from diverse backgrounds to learn, connect, and grow as entrepreneurs. Through workshops, events, and mentorship opportunities, UBC Startups provides a comprehensive ecosystem that empowers UBC's entrepreneurial community to take their ideas to the next level.",
        highlights: [
            "Venture Builder: We ideate, derisk, and launch ventures from scratch. This includes everything from developing a thesis on a problem space, testing different solutions, identifying first customers, assembling a founding team, and securing early stage venture funding.",
            "Venture Investor: Founders come to Diagram to pitch for capital. We invest in early stage companies that align with our fund's strategy."
        ],
        signupLink: "https://luma.com/we9e417e"
    },
    "foundher-2026": {
        title: "Founder’s Circle: UBC Startups Kickoff",
        date: "September 24, 2026",
        time: "6:00 PM - 8:00 PM",
        location: "AMS Nest Room 2306/2309",
        image: require("../images/eventPhotos/founders_circle_poster.jpeg"),
        imagePosition: "top",
        description: "Not sure if entrepreneurship is for you? Founder’s Circle is a kickoff event where you can hear from founders and entrepreneurship community members, meet students and alumni interested in startups, and learn about different paths into the startup world.",
        highlights: [
            "Hear from founders and members of the entrepreneurship community",
            "Meet students, founders, alumni, and others interested in entrepreneurship",
            "Learn about different paths into the startup world"
        ],
        signupLink: "https://luma.com/r54t2zy9",
        capacity: "Dress code: Business Casual"
    },
    "innovation-olympics-2025": {
        title: "The Crisis Room Challenge",
        date: "November 24, 2025",
        time: "6:00 PM - 8:30 PM",
        location: "UBC Life Building, Room 2202",
        image: require("../images/eventPhotos/event_poster.png"),
        description: "Join us for the Crisis Room Challenge — a fast-paced event where teams act as startup leaders navigating back-to-back crises in the tech industry. This event is a Model UN-style competition which will challenge your skills in analyzing scenarios, innovating rapid solutions, and pitching your strategies to a panel of industry professionals.",
        highlights: [
            "Hands-on experience in strategy and crisis management",
            "Respond to cyberattacks, investment freezes & global disruptions",
            "Debate, negotiate, and defend your plan",
            "Get judged by real industry professionals",
            "Earn awards for diplomacy, leadership, and insight"
        ],
        signupLink: "https://luma.com/9eo2rwv1",
        capacity: "No personal laptops"
    },
    "startup-games-2026": {
        title: "The Startup Games",
        date: "February 4, 2026",
        time: "5:00 PM - 8:00 PM",
        location: "AMS Student Nest, Great Hall North",
        image: require("../images/eventPhotos/startup_poster.jpg"),
        description: "Startup Games is a fast-paced, team-based event where you’ll tackle real startup challenges and collaborate with other students. ​You’ll be placed into small teams and asked to analyze problems, think strategically, and make decisions under time pressure. The event is designed to be interactive, hands-on, and high-energy, with a competitive but approachable environment. ​Whether you’re interested in startups, entrepreneurship, consulting, product, or innovation, this is a low-barrier way to build skills, network, and gain real-world experience.",
        highlights: [
            "Talk to real users",
            "Pivot based on live feedback",
            "Pitch your comeback in 2 minutes",
            "Network with experienced mentors",
            "Think fast. Build smarter. Save the startup."
        ],
        signupLink: "https://luma.com/okz4hpvy",
        capacity: "Light snacks and drinks will be provided. Spots are limited. No prior experience required."
    },
    "sample-event": {
        title: "UBC Startups Networking Night",
        date: "December 5, 2025",
        time: "6:00 PM - 9:00 PM",
        location: "UBC Life Building, Room 2201",
        image: require("../images/eventPhotos/liftoff_events.jpg"),
        description: "Join us for an exciting evening of networking, learning, and connecting with fellow entrepreneurs at UBC! Whether you're just starting your entrepreneurial journey or already running a startup, this event is the perfect opportunity to meet like-minded individuals, share ideas, and build meaningful connections.",
        highlights: [
            "Network with 100+ student entrepreneurs and founders",
            "Hear from successful UBC alumni founders",
            "Free food and refreshments",
            "Startup pitch sessions",
            "Workshop on fundraising basics"
        ],
        signupLink: "https://forms.gle/yourSignupLink",
        capacity: "Limited to 150 attendees"
    }
};

const EventPoster = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 110);
    }, []);

    // Get event data based on eventId, default to sample event if not found
    const event = eventData[eventId] || eventData["sample-event"];

    return (
        <>
            <NavigationBar />
            <Container>
                <PosterWrapper>
                    <BackButton onClick={() => navigate(-1)}>
                        ← Back to Events
                    </BackButton>

                    <PosterCard>
                        <PosterImage src={event.image} $imagePosition={event.imagePosition} />

                        <PosterContent>
                            <EventTitle>{event.title}</EventTitle>
                            <EventDate>{event.date}</EventDate>

                            <EventDescription>{event.description}</EventDescription>

                            <DetailsSection>
                                <DetailItem>
                                    <strong>📅 Date & Time</strong>
                                    <span>{event.date} at {event.time}</span>
                                </DetailItem>

                                <DetailItem>
                                    <strong>📍 Location</strong>
                                    <span>{event.location}</span>
                                </DetailItem>

                                <DetailItem>
                                    <strong>Event Highlights</strong>
                                    <span>
                                        <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
                                            {event.highlights.map((highlight, index) => (
                                                <li key={index} style={{ marginBottom: "8px" }}>{highlight}</li>
                                            ))}
                                        </ul>
                                    </span>
                                </DetailItem>

                                {event.capacity && (
                                    <DetailItem>
                                        <strong>Important</strong>
                                        <span>{event.capacity}</span>
                                    </DetailItem>
                                )}
                            </DetailsSection>

                            {event.signupLink && <SignUpSection>
                                <SignUpButton
                                    href={event.signupLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Sign Up Now
                                </SignUpButton>
                            </SignUpSection>}


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

export default EventPoster;
