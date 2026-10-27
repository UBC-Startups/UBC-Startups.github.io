import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventPoster from "../../../views/EventPoster";
import { eventPosters } from "../../../data/event-posters";

type Props = { params: Promise<{ eventId: string }> };

export function generateStaticParams() {
  return Object.keys(eventPosters).map(eventId => ({ eventId }));
}

function findEvent(eventId: string) {
  return Object.hasOwn(eventPosters, eventId)
    ? eventPosters[eventId as keyof typeof eventPosters]
    : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = findEvent((await params).eventId);
  return { title: event ? `${event.title} | UBC Startups` : "Event not found | UBC Startups" };
}

export default async function Page({ params }: Props) {
  const event = findEvent((await params).eventId);
  if (!event) notFound();
  return <EventPoster event={event} />;
}
