import styled from "styled-components";
import EventBox from "../components/event";

const OurEventsContainer = styled.div`
    overflow-x: hidden;
    position: relative;
    text-align: center;
    padding: 40px 0 48px;

    @media (max-width: 768px) {
        padding: 24px 0 32px;
    }
`;

const OurEventsTitle = styled.h1`
    font-weight: 500;
    text-align: center;
    font-size: 3em;
    margin-bottom: 12px;
    font-family: 'Sansation', sans-serif;
`;

const Subtitle = styled.p`
    color: #656464;
    font-size: 1.2em;
    margin-top: 0;
    max-width: 800px;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 0;
`;

const EventsGrid = styled.div`
    margin: 40px auto 0;
    max-width: 640px;
    display: grid;
    grid-gap: 50px;
    justify-items: center;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    padding: 0 25px;

    @media (max-width: 768px) {
        padding: 0 20px;
        grid-template-columns: 1fr;
        grid-gap: 24px;
    }
`;

const EmptyState = styled.div`
    margin: 40px auto 0;
    padding: 48px 24px;
    max-width: 500px;
    text-align: center;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.08);

    @media (max-width: 768px) {
        margin: 32px 24px 0;
    }
`;

const EmptyStateText = styled.p`
    font-size: 1.1em;
    color: #656464;
    margin: 0;
`;

const OurEvents = () => {
    // only display upcoming 2 events
    const events = [
        
    ];

    return (
        <OurEventsContainer id="events">
            <OurEventsTitle>Our Upcoming Events</OurEventsTitle>
            {events.length > 0 && (
                <Subtitle>
                    This year’s events are full of experiences including networking, case competitions, and much more!
                </Subtitle>
            )}

            {events.length === 0 ? (
                <EmptyState>
                    <EmptyStateText>No upcoming events at the moment — check back soon!</EmptyStateText>
                </EmptyState>
            ) : (
                <EventsGrid>
                    {events.map((value, index) => (
                        <EventBox
                            key={index}
                            img={value.img}
                            title={value.title}
                            description={value.description}
                            month={value.month}
                            day={value.day}
                            category={value.category}
                            posterLink={value.posterLink}
                        />
                    ))}
                </EventsGrid>
            )}
        </OurEventsContainer>
    );
};

export default OurEvents;

