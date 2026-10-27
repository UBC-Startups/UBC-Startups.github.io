import { events } from "../data/events";
import styles from "./Events.module.css";
import Layout from "../home/Layout";
import PageHero from "../home/sections/PageHero";
import EventCard from "../components/eventCard";
const Events = () => {
  const term1Events = events.filter(e => e.term === "Term 1");
  const term2Events = events.filter(e => e.term === "Term 2");
  return <Layout active="Events" footerTitle="Stay in the loop.">
            <PageHero eyebrow="Events 2026–27" title="Events" subtitle="Seven events across two terms, from our September kickoff to SOAR in March" />

            <section className={styles.Term}>
                <div className={styles.TermHeader}>
                    <p className={styles.TermTitle}>Term 1</p>
                    <p className={styles.TermDates}>September to November 2026</p>
                </div>
                <div className={styles.EventList}>
                    {term1Events.map(event => <div id={event.slug} key={event.title} className={styles.EventAnchor}>
                            <EventCard termTag={event.term} {...event} />
                        </div>)}
                </div>
            </section>

            <section className={styles.Term}>
                <div className={styles.TermHeader}>
                    <p className={styles.TermTitle}>Term 2</p>
                    <p className={styles.TermDates}>January to March 2027</p>
                </div>
                <div className={styles.EventList}>
                    {term2Events.map(event => <div id={event.slug} key={event.title} className={styles.EventAnchor}>
                            <EventCard termTag={event.term} {...event} />
                        </div>)}
                </div>
            </section>
        </Layout>;
};
export default Events;
