import styles from "./Layout.module.css";
import Nav from "./sections/Nav";
import NewsletterFooter from "./sections/NewsletterFooter";
import { copyrightYear } from "../lib/copyright-year";
/** Shared shell for the redesigned pages: nav, page content, newsletter + footer. */
export default async function Layout({
  active,
  footerTitle,
  children
}) {
  const year = await copyrightYear();
  return <div className={styles.Page}>
      <div id="top" className={styles.Frame}>
        <Nav active={active} />
        <main id="main-content">{children}</main>
        <NewsletterFooter title={footerTitle} year={year} />
      </div>
    </div>;
}
