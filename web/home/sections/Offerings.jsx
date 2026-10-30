import styles from "./Offerings.module.css";
import { programs } from "../content";
export default function Offerings() {
  return <section aria-labelledby="offer-title" className={styles.Section}>
      <header>
        <h2 id="offer-title">What we offer</h2>
        <p>↳ networking, workshops &amp; resources</p>
      </header>
      <ul className={styles.Grid}>
        {programs.map(p => <li key={p.name} className={styles.Card}>
            <div className={styles.Head}>
              <h3>{p.name}</h3>
              <img src={p.dots} alt="" aria-hidden />
            </div>
            <div className={styles.Visual} style={{
          "--visual-0": p.from,
          "--visual-1": p.to
        }}>
              <p className="number" aria-hidden>{p.number}</p>
              <p className="body">{p.body}</p>
            </div>
          </li>)}
      </ul>
    </section>;
}
