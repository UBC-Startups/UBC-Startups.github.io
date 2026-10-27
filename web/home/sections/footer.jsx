import styles from "./footer.module.css";
import { copyrightYear } from "../../lib/copyright-year";
const linkedin_c = "/images/linkedin-c.png";
const instagram_c = "/images/instagram-c.png";
const discord_c = "/images/discord-c.png";
const email = "/images/email.png";
const Footer = async () => {
  const year = await copyrightYear();
  return <div className={styles.FooterContainer}>
            <div className={styles.IconsRow}>
                <a href="https://www.instagram.com/ubcstartups/" target="_blank" className={styles.FooterColumnA} rel="noreferrer">
                    <img src={instagram_c} alt="instagram" className={styles.SocialImg} />
                </a>
                <a href="https://www.linkedin.com/company/ubc-startups/" target="_blank" className={styles.FooterColumnA} rel="noreferrer">
                    <img src={linkedin_c} alt="linkedin" className={styles.SocialImg} />
                </a>
                <a href="https://discord.gg/6HEmMc2mCh" target="_blank" className={styles.FooterColumnA} rel="noreferrer">
                    <img src={discord_c} alt="discord" className={styles.SocialImg} />
                </a>
                <a href="mailto:ubcstartups@gmail.com" target="_blank" className={styles.FooterColumnA} rel="noreferrer">
                    <img src={email} alt="email" className={styles.SocialImg} />
                </a>
            </div>
            <p className={styles.Copyright}>&copy; {year} UBC Startups. All rights reserved.</p>
        </div>;
};
export default Footer;
