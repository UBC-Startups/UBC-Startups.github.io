import Layout from "../home/Layout";
import Hero from "../home/casehack/Hero";
import Strategy from "../home/casehack/Strategy";
import Registration from "../home/casehack/Registration";
import { Faq, Hackathon, Prizes, Welcome } from "../home/casehack/Sections";
import { NextMove, Sponsors, UpNext } from "../home/casehack/Closing";

export default function CaseHack() {
  return (
    <Layout active="Events" footerTitle="Stay in the loop." tone="casehack">
      <div className="text-casehack-paper">
        <Hero signUpHref="#registration" />
        <Strategy />
        <div className="grid gap-[110px] pt-[120px] sm:px-xl lg:grid-cols-[minmax(0,1fr)_minmax(320px,424px)] lg:gap-[48px]">
          <div className="flex min-w-0 flex-col gap-[110px]">
            <Welcome />
            <Hackathon />
            <Prizes />
            <Faq />
          </div>
          <div className="row-start-1 lg:col-start-2"><Registration /></div>
        </div>
        <div className="flex flex-col gap-[96px] pt-[110px] sm:px-xl">
          <Sponsors />
          <UpNext />
          <NextMove />
        </div>
      </div>
    </Layout>
  );
}