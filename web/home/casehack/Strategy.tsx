import { Fragment } from "react";
import { casehack } from "../../data/casehack";

function StepArrow() {
  return <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className="hidden shrink-0 self-center lg:block">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="var(--color-casehack-mint-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export default function Strategy() {
  const { strategy } = casehack;
  return <section aria-labelledby="casehack-strategy" className="mt-sm flex flex-col gap-xxl rounded-panel bg-casehack-paper px-lg py-xxxl sm:px-[56px]">
    <div className="flex flex-col gap-lg text-casehack-forest lg:flex-row lg:items-end lg:justify-between">
      <h2 id="casehack-strategy" className="font-mono text-[clamp(32px,3.6vw,52px)] leading-[1.1] font-bold tracking-[-0.03em]">
        {strategy.headingTop}<br />{strategy.headingBottom}
      </h2>
      <p className="max-w-[440px] font-brand text-[17px] leading-[1.5]">{strategy.intro}</p>
    </div>
    <ol className="m-0 flex list-none flex-col gap-sm p-0 lg:flex-row lg:items-stretch">
      {strategy.steps.map((step, i) => {
        const last = i === strategy.steps.length - 1;
        return <Fragment key={step.step}>
          {i > 0 && <StepArrow />}
          <li className={`flex flex-1 flex-col gap-xs rounded-[8px] p-lg ${last ? "bg-casehack-forest" : "bg-surface"}`}>
            <p className={`font-mono text-[11px] font-bold tracking-[0.1em] ${last ? "text-casehack-mint" : "text-casehack-mint-dim"}`}>{step.step}</p>
            <h3 className={`m-0 font-brand text-[20px] leading-[1.5] font-semibold ${last ? "text-casehack-paper" : "text-casehack-forest"}`}>{step.title}</h3>
            <p className={`font-brand text-[14px] leading-[1.5] ${last ? "text-casehack-muted" : "text-casehack-forest"}`}>{step.description}</p>
          </li>
        </Fragment>;
      })}
    </ol>
  </section>;
}