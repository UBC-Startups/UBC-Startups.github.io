import type { ReactNode } from "react";
import { PageContainer } from "../components/ui";
import { copyrightYear } from "../lib/copyright-year";
import Nav from "./sections/Nav";
import NewsletterFooter from "./sections/NewsletterFooter";

type LayoutProps = { active?: string; footerTitle?: string; tone?: "light" | "casehack"; children: ReactNode };

const pageBackground = { light: "bg-canvas", casehack: "bg-casehack-forest" } as const;

export default async function Layout({ active, footerTitle, tone = "light", children }: LayoutProps) {
  const year = await copyrightYear();
  return <div className={`min-h-screen ${pageBackground[tone]}`}>
    <PageContainer id="top">
      <Nav active={active} tone={tone} />
      <main id="main-content">{children}</main>
      <NewsletterFooter title={footerTitle} year={year} />
    </PageContainer>
  </div>;
}