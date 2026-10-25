import styles from "./eventCard.module.css";
import Link from "next/link";
const EventCard = ({
  number,
  termTag,
  extraTags = [],
  date,
  year,
  gradientFrom,
  gradientTo,
  title,
  description,
  highlight,
  duration,
  expected,
  format,
  venue,
  whoFor,
  status,
  signUpLink,
  detailsLink,
  photos = [],
  image
}) => {
  return <div className={styles.Card}>
            <div className={styles.Visual} style={{
      "--visual-0": image ? `linear-gradient(to bottom, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.65)), url(${image})` : `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`,
      "--visual-1": status === "past" ? "grayscale(0.7)" : "none",
      "--visual-2": status === "past" ? 0.75 : 1
    }}>
                <p className={styles.BigNumber}>{number}</p>
                <div className={styles.Tags}>
                    <div className={styles.Tag} style={{
          "--tag-0": "#cc4414",
          "--tag-1": "#fff"
        }}>{termTag}</div>
                    {extraTags.map(tag => <div key={tag} className={styles.Tag} style={{
          "--tag-0": "#fff",
          "--tag-1": "#0a0a0a"
        }}>{tag}</div>)}
                </div>
                <div className={styles.DateBlock}>
                    <p className={styles.DateText}>{date}</p>
                    <p className={styles.YearText}>{year}</p>
                </div>
            </div>

            <div className={styles.Content}>
                <p className={styles.Title}>{title}</p>
                <p className={styles.Description}>{description}</p>

                {highlight && <div className={styles.Highlight}>{highlight}</div>}

                <div className={styles.Details}>
                    <div className={styles.DetailBlock}>
                        <p className={styles.DetailLabel}>DURATION</p>
                        <p className={styles.DetailValue}>{duration}</p>
                    </div>
                    {expected && <div className={styles.DetailBlock}>
                        <p className={styles.DetailLabel}>EXPECTED</p>
                        <p className={styles.DetailValue}>{expected}</p>
                    </div>}
                    <div className={styles.DetailBlock}>
                        <p className={styles.DetailLabel}>FORMAT</p>
                        <p className={styles.DetailValue}>{format}</p>
                    </div>
                    {venue && <div className={styles.DetailBlock}>
                            <p className={styles.DetailLabel}>VENUE</p>
                            <p className={styles.DetailValue}>{venue}</p>
                        </div>}
                    <div className={styles.DetailBlock}>
                        <p className={styles.DetailLabel}>WHO IT&apos;S FOR</p>
                        <p className={styles.DetailValue}>{whoFor}</p>
                    </div>
                </div>

                {photos.length > 0 && <div className={styles.PhotoStrip}>
                        {photos.map((photo, i) => <img key={i} src={photo} alt={`${title} photo ${i + 1}`} className={styles.Photo} />)}
                    </div>}

                {status === "next" && <p className={styles.ComingSoonPill}>Sign up details coming soon</p>}
                {status === "default" && signUpLink && (signUpLink.startsWith("/") ? <Link href={signUpLink} className={styles.SignUpRouterLink}>Sign up</Link> : <a href={signUpLink} target="_blank" rel="noreferrer" className={styles.SignUpButton}>Sign up</a>)}
                {status === "past" && detailsLink && <a href={detailsLink} target="_blank" rel="noreferrer" className={styles.DetailsLink}>See more details →</a>}
            </div>
        </div>;
};
export default EventCard;
