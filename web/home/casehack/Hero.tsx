import Link from "next/link";
import { casehack } from "../../data/casehack";
import { ChButton, ChTag, FieldLabel } from "./ui";
import styles from "./CaseHack.module.css";

const binaryLeft = ["010001","011001","100010","100011","001001","100100","100100","010100","101100","000011","100001","000010","011111","111000","001101","001001","011001","100011","110100","001110","000000","001000","100000","010101"];
const binaryRight = ["111111","101110","111100","110000","101101","010010","010010","110100","011000","110111","111010","110000","000100","011000","100101","100001","000101","111011","011110","111011","101000","101100","001100","111001"];

const barTone = { dim: "bg-casehack-mint-dim", mint: "bg-casehack-mint", bright: "bg-casehack-mint-bright" } as const;

function Binary({ lines, side }: { lines: string[]; side: "left" | "right" }) {
  return <div aria-hidden="true" className={`absolute top-[71px] hidden font-mono text-[14px] leading-[1.6] font-medium text-casehack-mint xl:block ${side === "left" ? "left-[27px]" : "right-[27px]"}`}>
    {lines.map((line, i) => <div key={i}>{line}</div>)}
  </div>;
}

function ChartCard() {
  const { chart } = casehack.hero;
  return <figure className="m-0 flex w-full max-w-[460px] shrink-0 flex-col gap-[20px] rounded-[8px] border border-solid border-casehack-line bg-casehack-forest p-[24px]">
    <figcaption className="font-mono text-[11px] font-medium tracking-[0.08em] text-casehack-muted">{chart.title}</figcaption>
    <div className="relative h-[200px] w-full" aria-hidden="true">
      {[20, 70, 120, 170].map(top => <div key={top} className="absolute left-0 h-px w-full bg-casehack-line" style={{ top }} />)}
      <div className="absolute inset-x-0 bottom-0 grid grid-cols-4 items-end">
        {chart.bars.map(bar => <div key={bar.label} className="flex justify-center">
          <div className={`w-[56px] rounded-t-[2px] ${barTone[bar.tone]}`} style={{ height: bar.height }} />
        </div>)}
      </div>
      {/* Trend line (Figma vector), drawn to the bar-centre geometry at 412×200. */}
      <svg className="absolute inset-0 size-full" viewBox="0 0 412 200" preserveAspectRatio="none" fill="none">
        <line x1="51.5" y1="130" x2="360.5" y2="10" stroke="var(--color-casehack-paper)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="absolute size-[10px] bg-casehack-paper" style={{ left: "calc(360.5 / 412 * 100% - 5px)", top: 5 }} />
    </div>
    <div className="grid grid-cols-4" aria-hidden="true">
      {chart.bars.map(bar => <p key={bar.label} className="text-center font-mono text-[10px] font-medium tracking-[0.1em] text-casehack-muted">{bar.label}</p>)}
    </div>
    <div className="h-px w-full bg-casehack-line" />
    <dl className="m-0 grid grid-cols-3">
      {chart.kpis.map(kpi => <div key={kpi.label} className="flex flex-col gap-[4px]">
        <dt><FieldLabel className="text-casehack-muted">{kpi.label}</FieldLabel></dt>
        <dd className={`m-0 font-mono font-bold text-casehack-paper ${"small" in kpi ? "text-[20px]" : "text-[26px]"}`}>{kpi.value}</dd>
      </div>)}
    </dl>
  </figure>;
}

export default function Hero({ signUpHref }: { signUpHref: string }) {
  const { hero } = casehack;
  return <section aria-labelledby="casehack-title" className="relative isolate overflow-hidden rounded-panel border border-solid border-casehack-line bg-casehack-forest-raised px-lg pt-xxl pb-xxxl sm:px-xxxl xl:px-[104px]">
    <div aria-hidden="true" className={`absolute inset-0 -z-10 ${styles.grid}`} />
    <Binary lines={binaryLeft} side="left" />
    <Binary lines={binaryRight} side="right" />

    <Link href="/events" className="font-mono text-[15px] font-bold tracking-[0.08em] text-casehack-paper no-underline hover:text-casehack-mint">← ALL EVENTS</Link>

    <div className="mt-[56px] flex flex-col gap-xxl lg:flex-row lg:items-end lg:justify-between">
      <div className="flex min-w-0 flex-col gap-lg">
        <p className="font-mono text-[clamp(14px,1.4vw,18px)] font-medium tracking-[0.24em] text-casehack-mint">{hero.eyebrow}</p>
        <h1 id="casehack-title" className="m-0 font-mono text-[clamp(88px,12vw,172px)] leading-[0.88] font-extrabold tracking-[-0.04em] text-casehack-paper">
          {hero.titleTop}<br /><span className="text-casehack-mint">{hero.titleBottom}</span>
        </h1>
        <p className="font-mono text-[clamp(16px,1.5vw,20px)] font-bold tracking-[0.02em] text-casehack-paper">{hero.tagline}</p>
        <ul className="m-0 flex list-none flex-wrap gap-xs p-0">
          {hero.facts.map(fact => <li key={fact}><ChTag>{fact}</ChTag></li>)}
        </ul>
        <div className="flex flex-wrap gap-sm pt-xs">
          <ChButton href={signUpHref}>SIGN UP →</ChButton>
          <ChButton href="#prizes" variant="ghost">SEE PRIZES</ChButton>
        </div>
      </div>
      <ChartCard />
    </div>
  </section>;
}