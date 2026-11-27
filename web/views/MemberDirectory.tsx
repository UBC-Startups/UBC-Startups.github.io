"use client";

import { useState } from "react";
import { Button, Card, Heading, Text, TextField } from "@/components/ui";
import { filterMembers, initials, type DirectoryMember } from "@/lib/members/search";

const PAGE_SIZE = 12;

export default function MemberDirectory({ members }: { members: DirectoryMember[] }) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const matches = filterMembers(members, query);
  const visible = matches.slice(0, visibleCount);

  return <div className="flex flex-col gap-lg">
    <div className="relative">
      <svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute top-1/2 left-lg size-4 -translate-y-1/2 fill-none stroke-ink-secondary stroke-[1.5]">
        <circle cx="7" cy="7" r="5" /><path d="m11 11 3.5 3.5" strokeLinecap="round" />
      </svg>
      <TextField
        id="member-search"
        type="search"
        label="Search members by name"
        hideLabel
        placeholder="Search by name"
        autoComplete="off"
        value={query}
        onChange={event => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE); }}
        className="pl-12"
      />
    </div>

    <Text variant="label-s" aria-live="polite">
      {matches.length ? `Showing ${visible.length} of ${matches.length} members` : query ? `No members match “${query.trim()}”.` : "No members yet."}
    </Text>

    {visible.length > 0 && <ul className="m-0 grid list-none grid-cols-1 gap-md p-0 sm:grid-cols-2 lg:grid-cols-4">
      {visible.map(member => <li key={member.id}>
        <Card as="article" className="flex h-full flex-col gap-md">
          <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-brand-green/30 font-brand text-label-l text-ink">{initials(member)}</span>
          <Heading as="h3" variant="heading-s" className="break-words">{member.firstName} {member.lastName}</Heading>
        </Card>
      </li>)}
    </ul>}

    {visible.length < matches.length && <Button variant="secondary" className="self-center" onClick={() => setVisibleCount(count => count + PAGE_SIZE)}>Load more members</Button>}
  </div>;
}
