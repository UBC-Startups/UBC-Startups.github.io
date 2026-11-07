import Link from "next/link";
import { casehack } from "../../data/casehack";
import { events } from "../../data/events";
import { links } from "../content";
import { calendarUrl } from "./Registration";
import { ChButton, ChLabel, FieldLabel, SectionHeading, SignUpButton } from "./ui";

const slotHeight = { lg: "h-[160px]", md: "h-[120px]", sm: "h-[96px]" } as const;
const slotColumns = { lg: "grid-cols-1", md: "sm:grid-cols-3", sm: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" } as const;

export function Sponsors() {
  return <section aria-labelledby="casehack-sponsors" className="flex flex-col gap-lg">
    <div className="flex flex-col gap-md sm:flex-row sm:items-end sm:justify-between">
      <SectionHeading id="casehack-sponsors" top="Made possible by" />
      <ChButton href={links.email} variant="ghost">BECOME A SPONSOR</ChButton>
    </div>
    {casehack.sponsors.map(tier => <div key={tier.tier} className="flex flex-col gap-sm">
      <FieldLabel>{tier.tier}</FieldLabel>
      <ul className={`m-0 grid list-none gap-sm p-0 ${slotColumns[tier.size]}`}>
        {Array.from({ length: tier.slots }, (_, i) => <li key={i} className={`flex items-center justify-center rounded-[8px] border border-solid border-casehack-line bg-casehack-forest-raised ${slotHeight[tier.size]}`}>
          <span className="font-mono text-[13px] font-medium tracking-[0.1em] text-casehack-muted">[ LOGO ]</span>
        </li>)}
      </ul>
    </div>)}
  </section>;
}

export function UpNext() {
  const rows = casehack.upNext.map(item => ({ ...item, event: events.find(e => e.slug === item.slug) })).filter(row => row.event);
  return <section aria-labelledby="casehack-up-next" className="flex flex-col gap-lg">
    <h2 id="casehack-up-next" className="m-0"><ChLabel>{"// NEXT EVENTS"}</ChLabel></h2>
    <ul className="m-0 list-none overflow-hidden rounded-[8px] border border-solid border-casehack-line bg-casehack-forest-raised p-0">
      {rows.map(({ slug, blurb, event }) => <li key={slug} className="border-0 border-t border-solid border-casehack-line first:border-t-0">
        <Link href={`/events#${slug}`} className="group flex flex-col gap-xs px-[28px] py-[22px] no-underline md:flex-row md:items-center md:gap-xl">
          <span className="font-mono text-[14px] font-bold tracking-[0.04em] text-casehack-mint md:w-[140px] md:shrink-0">{`${event!.date}, ${event!.year}`.toUpperCase()}</span>
          <span className="font-mono text-[22px] font-bold tracking-[-0.02em] text-casehack-paper md:w-[240px] md:shrink-0">{event!.title}</span>
          <span className="flex-1 font-brand text-[15px] leading-[1.55] text-casehack-muted">{blurb}</span>
          <span aria-hidden="true" className="font-mono text-[13px] font-medium tracking-[0.08em] text-casehack-mint group-hover:text-casehack-mint-bright">VIEW →</span>
        </Link>
      </li>)}
    </ul>
  </section>;
}

export function NextMove() {
  const { registration } = casehack;
  return <section aria-labelledby="casehack-next-move" className="flex flex-col gap-xl rounded-panel border border-solid border-casehack-mint-dim bg-casehack-forest-raised px-lg py-xxxl sm:px-[56px] lg:flex-row lg:items-end lg:justify-between">
    <h2 id="casehack-next-move" className="m-0 font-mono text-[clamp(56px,6.7vw,96px)] leading-[0.92] font-extrabold tracking-[-0.04em] text-casehack-paper">
      BUILD THE<br /><span className="text-casehack-mint">NEXT MOVE</span>
    </h2>
    <div className="flex flex-col gap-[20px]">
      <div className="flex flex-wrap gap-sm">
        <SignUpButton href={registration.signUpUrl} />
        <ChButton href={calendarUrl()} variant="ghost">ADD TO CALENDAR</ChButton>
      </div>
      <FieldLabel>{registration.deadline}</FieldLabel>
    </div>
  </section>;
}