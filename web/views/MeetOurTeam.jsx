import styles from "./MeetOurTeam.module.css";
import Layout from "../home/Layout";
import PageHero from "../home/sections/PageHero";
import { figma } from "../home/theme";
import { teamSections } from "../data/team";
import TeamPhotoFill from "../home/TeamPhotoFill";

// Team page redesign (Figma: "UBC Startups — Website Remix", TEAM PAGE frame).
// Roster data still comes from src/data/team.js.

function TeamPhoto({
  m
}) {
  if (!m.image) {
    return <div className={[styles.Photo, "empty"].join(" ")}>
        <img className="placeholder" src={figma("logo-mark.svg")} alt="" />
      </div>;
  }
  return <div className={styles.Photo}>
      <TeamPhotoFill member={m} />
    </div>;
}
function MemberCard({
  m
}) {
  const content = <>
      <TeamPhoto m={m} />
      <p className="name">{m.name}</p>
      <p className="role">{m.role}</p>
    </>;
  return <li className={styles.Member}>
      {m.linkedIn ? <a href={m.linkedIn} target="_blank" rel="noreferrer" aria-label={`${m.name} on LinkedIn`} className={styles.MemberLink}>
          {content}
        </a> : <div className={styles.MemberStatic}>{content}</div>}
    </li>;
}

// Leadership puts the presidents on their own row, as in the design.
function rowsFor(title, members) {
  if (title !== "Leadership") return [members];
  const presidents = members.filter(m => /president/i.test(m.role) && !/vice|vp/i.test(m.role));
  const rest = members.filter(m => !presidents.includes(m));
  return presidents.length ? [presidents, rest] : [members];
}
const MeetOurTeam = () => <Layout active="Team" footerTitle="Stay in the loop.">
    <PageHero eyebrow="Team 2026–27" title="Team" subtitle="The people behind UBC Startups" />
    <section aria-labelledby="exec-title" className={styles.Section}>
      <h2 id="exec-title">Meet the 2026/27 exec team</h2>
      {teamSections.map(({
      title,
      members
    }) => <section key={title} aria-label={title} className={styles.Group}>
          <h3>{title}</h3>
          {rowsFor(title, members).map((row, i) => <ul key={i} className={styles.Row}>
              {row.map(m => <MemberCard key={m.name} m={m} />)}
            </ul>)}
        </section>)}
    </section>
  </Layout>;
export default MeetOurTeam;
