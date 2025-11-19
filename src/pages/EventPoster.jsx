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
  "foundher-brunch-2026": {
    title: "Found(Her)'s Brunch (2026W)",
    date: "March 8, 2026",
    time: "11:00 AM - 2:00 PM",
    location: "UBC Life Building, Multi-Purpose Room",
    image: require("../images/AboutImage1.jpg"),
    description: "Celebrate International Women's Day with Found(Her)'s Brunch, featuring talks, Q&A, and networking with successful women founders and leaders. Connect, be inspired, and engage in conversations about entrepreneurship and empowerment.",
    highlights: [
      "Panel discussions with successful women founders",
      "Interactive Q&A sessions",
      "Networking opportunities with women leaders",
      "Inspiring talks on entrepreneurship and empowerment",
      "Complimentary brunch and refreshments"
    ],
    signupLink: "https://forms.gle/yourSignupLink",
    capacity: "Limited to 120 attendees"
  },
  "soar-2026": {
    title: "SOAR (2026W)",
    date: "March 21, 2026",
    time: "9:00 AM - 5:00 PM",
    location: "UBC Life Building, Main Auditorium",
    image: require("../images/eventPhotos/soarImage.png"),
    description: "SOAR is the university's largest pitch competition with a $10,000 prize pool! Student founders pitch their ideas to investors and industry leaders, receive feedback, and compete for funding. With networking, lunch, and a full day of presentations, SOAR is the perfect way to be inspired and support the next wave of UBC entrepreneurs.",
    highlights: [
      "Compete for $10,000 in non-dilutive funding",
      "Pitch to real investors and industry leaders",
      "Receive expert feedback on your startup",
      "Full day of networking and presentations",
      "Lunch and refreshments provided"
    ],
    signupLink: "https://forms.gle/yourSignupLink",
    capacity: "Limited to 200 attendees - Apply early!"
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
            <PosterImage src={event.image} />
            
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
              
              <SignUpSection>
                <SignUpButton href={event.signupLink} target="_blank" rel="noopener noreferrer">
                  Sign Up Now
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

export default EventPoster;
