import Image from "next/image";
import { Heading, Text } from "../../components/ui";
import { Glow } from "../ui";
import styles from "./PageHero.module.css";

export default function PageHero({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return <section aria-labelledby="page-title" className="full-bleed relative isolate overflow-hidden bg-inverse font-brand">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <Glow $inset="-22.22%" style={{ left: -200, top: 420, width: 900, height: 900 }}><div><Image src="/figma/page-hero-glow-bottom-left.svg" alt="" fill sizes="1300px" /></div></Glow>
      <Glow $inset="-25%" style={{ left: 900, top: -300, width: 800, height: 800 }}><div><Image src="/figma/page-hero-glow-top-right.svg" alt="" fill sizes="1200px" /></div></Glow>
      <div className={styles.orangeGlow} />
    </div>
    <div className="relative mx-auto flex min-h-[380px] max-w-site flex-col justify-end gap-sm px-page-gutter py-xxl sm:min-h-[560px] sm:px-page-gutter-sm sm:pt-12 sm:pb-14 lg:px-page-gutter-lg">
      <Text variant="eyebrow" className="text-ink-inverse-soft">{eyebrow}</Text>
      <Heading as="h1" variant="page-title" id="page-title" className="text-ink-inverse">{title}</Heading>
      <Text variant="page-subtitle" className="text-ink-inverse-subtle">{subtitle}</Text>
    </div>
  </section>;
}
