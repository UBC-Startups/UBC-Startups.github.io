import { casehack } from "../../data/casehack";
import { FieldLabel, PixelBar, SignUpButton } from "./ui";
import ShareButton from "./ShareButton";

export function calendarUrl() {
  const c = casehack.calendar;
  const params = new URLSearchParams({ action: "TEMPLATE", text: c.title, dates: `${c.start}/${c.end}`, ctz: c.timeZone, location: c.location });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export default function Registration() {
  const { registration: r } = casehack;
  const lit = Math.round((r.capacity.taken / r.capacity.total) * 20);
  return <aside aria-label="Registration" className="flex flex-col gap-md lg:sticky lg:top-[96px]">
    <div id="registration" className="flex flex-col gap-[20px] rounded-[8px] border border-solid border-casehack-line bg-casehack-forest-raised p-[28px]">
      <div className="flex items-center justify-between">
        <h2 className="m-0 font-mono text-[14px] font-bold tracking-[0.08em] text-casehack-paper">REGISTRATION</h2>
        <p className="font-mono text-[12px] font-medium tracking-[0.08em] text-casehack-mint">● {r.status}</p>
      </div>
      <dl className="m-0 flex flex-col gap-md">
        {r.rows.map(row => <div key={row.label} className="flex flex-col gap-xxs">
          <dt><FieldLabel>{row.label}</FieldLabel></dt>
          <dd className="m-0 font-brand text-[15px] leading-[1.55] font-medium text-casehack-paper">{row.value}</dd>
        </div>)}
      </dl>
      <div className="h-px w-full bg-casehack-line" />
      <div className="flex flex-col gap-[10px]">
        <div className="flex items-start justify-between">
          <FieldLabel>CAPACITY</FieldLabel>
          <p className="font-mono text-[13px] font-bold text-casehack-paper">{r.capacity.taken}/{r.capacity.total}</p>
        </div>
        <PixelBar lit={lit} total={20} size={13} label={`${r.capacity.taken} of ${r.capacity.total} spots taken`} />
        <FieldLabel className="text-casehack-muted">{r.deadline}</FieldLabel>
      </div>
      <SignUpButton href={r.signUpUrl} className="w-full" />
      <div className="flex items-start justify-between">
        <a href={calendarUrl()} target="_blank" rel="noreferrer" className="font-mono text-[12px] font-medium tracking-[0.06em] text-casehack-mint no-underline hover:text-casehack-mint-bright">+ ADD TO CALENDAR</a>
        <ShareButton />
      </div>
    </div>
    <div className="flex flex-col gap-xs rounded-[8px] border border-dashed border-casehack-mint-dim bg-casehack-forest p-lg">
      <p className="font-mono text-[13px] font-bold tracking-[0.04em] text-casehack-mint">{r.soloNote.title}</p>
      <p className="font-brand text-[14px] leading-[1.55] text-casehack-muted">{r.soloNote.body}</p>
    </div>
  </aside>;
}