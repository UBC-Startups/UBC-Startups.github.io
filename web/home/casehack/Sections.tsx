import { casehack, type CaseHackTone } from "../../data/casehack";
import { FieldLabel, PixelBar, SectionHeading } from "./ui";

const bodyText = "font-brand text-[17px] leading-[1.55] text-casehack-muted";

export function Welcome() {
  const { welcome } = casehack;
  return <section aria-labelledby="casehack-welcome" className="flex flex-col gap-lg">
    <SectionHeading id="casehack-welcome" top="Welcome to" bottom="CaseHack" accentBottom />
    {welcome.paragraphs.map(p => <p key={p} className={bodyText}>{p}</p>)}
    <dl className="m-0 grid gap-xl pt-xs sm:grid-cols-2">
      {welcome.details.map(d => <div key={d.label} className="flex flex-col gap-[6px]">
        <dt><FieldLabel>{d.label}</FieldLabel></dt>
        <dd className="m-0 font-brand text-[15px] leading-[1.55] font-medium text-casehack-paper">{d.value}</dd>
      </div>)}
    </dl>
  </section>;
}

const roleTone: Record<CaseHackTone, string> = {
  mint: "bg-casehack-mint text-casehack-forest",
  bright: "bg-casehack-mint-bright text-casehack-forest",
  dim: "bg-casehack-mint-dim text-casehack-mint-bright",
  outline: "bg-casehack-forest text-casehack-mint border-[1.5px] border-solid border-casehack-mint",
};

export function Hackathon() {
  const { hackathon } = casehack;
  return <section aria-labelledby="casehack-hackathon" className="flex flex-col gap-lg">
    <SectionHeading id="casehack-hackathon" top="What is a" bottom="hackathon?" />
    {hackathon.paragraphs.map(p => <p key={p} className={bodyText}>{p}</p>)}
    <ol aria-label="Every team mixes four roles" className="m-0 flex list-none flex-col items-center gap-md rounded-[8px] border border-solid border-casehack-line bg-casehack-forest-raised p-xxl sm:flex-row sm:items-start sm:gap-0">
      {hackathon.roles.map((role, i) => <li key={role.label} className="contents">
        {i > 0 && <span aria-hidden="true" className="h-lg w-0 border-0 border-l border-dashed border-casehack-mint-dim sm:mx-xs sm:mt-[48px] sm:h-0 sm:flex-1 sm:border-l-0 sm:border-t" />}
        <div className="flex shrink-0 flex-col items-center gap-[14px]">
          <span className={`flex size-[96px] items-center justify-center rounded-full font-mono text-[15px] font-bold tracking-[0.04em] ${roleTone[role.tone]}`}>{role.label}</span>
          <FieldLabel className="text-casehack-muted">{role.caption}</FieldLabel>
        </div>
      </li>)}
    </ol>
  </section>;
}

export function Prizes() {
  const { prizes } = casehack;
  return <section id="prizes" aria-labelledby="casehack-prizes" className="flex flex-col gap-lg">
    <SectionHeading id="casehack-prizes" top="Prizes" />
    <p className={bodyText}>{prizes.intro}</p>
    {prizes.items.map(prize => <article key={prize.title} className="flex min-h-[340px] flex-col gap-md rounded-[8px] border border-solid border-casehack-line bg-casehack-forest-raised p-xl">
      <FieldLabel className="text-casehack-muted">{prize.label}</FieldLabel>
      <h3 className="m-0 font-mono text-[32px] font-bold tracking-[-0.03em] text-casehack-mint-bright">{prize.title}</h3>
      <p className="font-brand text-[15px] leading-[1.55] text-casehack-muted">{prize.description}</p>
      <div className="mt-auto flex flex-col gap-[10px] border-0 border-t border-solid border-casehack-line pt-md">
        <FieldLabel>ELIGIBILITY</FieldLabel>
        <PixelBar lit={6} total={6} label={prize.eligibility} />
        <p className="font-mono text-[12px] font-medium tracking-[0.06em] text-casehack-paper">{prize.eligibility}</p>
      </div>
    </article>)}
  </section>;
}

export function Faq() {
  return <section aria-labelledby="casehack-faq" className="flex flex-col gap-lg">
    <SectionHeading id="casehack-faq" top="FAQ" />
    <div className="flex flex-col gap-[10px]">
      {casehack.faq.map((item, i) => <details key={item.question} open={i === 0} className="group rounded-[8px] border border-solid border-casehack-line bg-casehack-forest-raised px-lg py-[20px] open:border-casehack-mint-dim">
        <summary className="flex cursor-pointer list-none items-center gap-md [&::-webkit-details-marker]:hidden">
          <span aria-hidden="true" className="font-mono text-[15px] font-bold text-casehack-mint">Q.</span>
          <span className="flex-1 font-brand text-[17px] leading-[1.45] font-medium text-casehack-paper">{item.question}</span>
          <span aria-hidden="true" className="font-mono text-[15px] font-medium text-casehack-mint group-open:hidden">[+]</span>
          <span aria-hidden="true" className="hidden font-mono text-[15px] font-medium text-casehack-mint group-open:inline">[−]</span>
        </summary>
        <p className="mt-sm font-brand text-[15px] leading-[1.45] text-casehack-muted">{item.answer}</p>
      </details>)}
    </div>
  </section>;
}