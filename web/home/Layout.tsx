import type { ReactNode } from "react";
import { PageContainer } from "../components/ui";
import { copyrightYear } from "../lib/copyright-year";
import Nav from "./sections/Nav";
import NewsletterFooter from "./sections/NewsletterFooter";

type LayoutProps = { active?: string; footerTitle?: string; children: ReactNode };

export default async function Layout({ active, footerTitle, children }: LayoutProps) {
  const year = await copyrightYear();
  return <div className="min-h-screen bg-canvas">
    <PageContainer id="top">
      <Nav active={active} />
      <main id="main-content">{children}</main>
      <NewsletterFooter title={footerTitle} year={year} />
    </PageContainer>
  </div>;
}
