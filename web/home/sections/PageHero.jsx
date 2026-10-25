import styles from "./PageHero.module.css";
import { figma } from "../theme";
import { Glow } from "../ui";
/** Dark hero used at the top of the Events and Team pages. */
export default function PageHero({
  eyebrow,
  title,
  subtitle
}) {
  return <section aria-labelledby="page-title" className={styles.Section}>
      <div aria-hidden className={styles.Glows}>
        <Glow $inset="-22.22%" style={{
        left: -200,
        top: 420,
        width: 900,
        height: 900
      }}>
          <div><img src={figma("page-hero-glow-bottom-left.svg")} alt="" /></div>
        </Glow>
        <Glow $inset="-25%" style={{
        left: 900,
        top: -300,
        width: 800,
        height: 800
      }}>
          <div><img src={figma("page-hero-glow-top-right.svg")} alt="" /></div>
        </Glow>
        <div className={styles.OrangeGlow} />
      </div>
      <p className={styles.Eyebrow}>{eyebrow}</p>
      <h1 id="page-title" className={styles.Title}>{title}</h1>
      <p className={styles.Subtitle}>{subtitle}</p>
    </section>;
}
