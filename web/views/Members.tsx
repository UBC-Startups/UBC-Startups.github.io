import { Heading, Text } from "@/components/ui";
import Layout from "@/home/Layout";
import PageHero from "@/home/sections/PageHero";
import { SectionLabel } from "@/home/ui";
import type { DirectoryMember } from "@/lib/members/search";
import MemberDirectory from "./MemberDirectory";

export default function Members({ members }: { members: DirectoryMember[] }) {
  return <Layout active="Members" footerTitle="Stay in the loop.">
    <PageHero eyebrow="Community" title="Members" subtitle="Students, founders, mentors and judges who make up UBC's startup scene." />
    <section aria-labelledby="directory-title" className="flex flex-col gap-xl px-md pt-20 sm:px-xl sm:pt-30">
      <div className="flex flex-col gap-md">
        <SectionLabel label="Member directory" />
        <Heading id="directory-title" variant="heading-xl">Find your people.</Heading>
        <Text className="max-w-[560px] text-ink-secondary">UBC students building something, plus the mentors, judges and speakers who&apos;ve been part of our events.</Text>
      </div>
      <MemberDirectory members={members} />
    </section>
  </Layout>;
}
