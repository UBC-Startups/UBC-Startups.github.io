import styles from "./EventPoster.module.css";
import Link from "next/link";
import NavigationBar from "../components/navigationBar";
import Footer from "../home/sections/footer";
// Event data - you can customize these for your specific events
const EventPoster = ({
  event
}) => {
  return <>
            <NavigationBar />
            <main id="main-content" className={styles.Container}>
                <div className={styles.PosterWrapper}>
                    <Link href="/events" className={styles.BackButton}>
                        ← Back to Events
                    </Link>

                    <div className={styles.PosterCard}>
                        <div role="img" aria-label={event.title} className={styles.PosterImage} style={{
            "--posterimage-0": `url(${event.image})`,
            "--posterimage-1": event.imagePosition || "center"
          }} />

                        <div className={styles.PosterContent}>
                            <h1 className={styles.EventTitle}>{event.title}</h1>
                            <div className={styles.EventDate}>{event.date}</div>

                            <p className={styles.EventDescription}>{event.description}</p>

                            <div className={styles.DetailsSection}>
                                <div className={styles.DetailItem}>
                                    <strong>📅 Date & Time</strong>
                                    <span>{event.date} at {event.time}</span>
                                </div>

                                <div className={styles.DetailItem}>
                                    <strong>📍 Location</strong>
                                    <span>{event.location}</span>
                                </div>

                                <div className={styles.DetailItem}>
                                    <strong>Event Highlights</strong>
                                    <span>
                                        <ul style={{
                    marginTop: "10px",
                    paddingLeft: "20px"
                  }}>
                                            {event.highlights.map((highlight, index) => <li key={index} style={{
                      marginBottom: "8px"
                    }}>{highlight}</li>)}
                                        </ul>
                                    </span>
                                </div>

                                {event.capacity && <div className={styles.DetailItem}>
                                        <strong>Important</strong>
                                        <span>{event.capacity}</span>
                                    </div>}
                            </div>

                            {event.signupLink && <div className={styles.SignUpSection}>
                                <a href={event.signupLink} target="_blank" rel="noopener noreferrer" className={styles.SignUpButton}>
                                    Sign Up Now
                                </a>
                            </div>}


                            <p className={styles.ContactInfo}>
                                Questions? Contact us at{" "}
                                <a href="mailto:ubcstartups@gmail.com">ubcstartups@gmail.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>;
};
export default EventPoster;
