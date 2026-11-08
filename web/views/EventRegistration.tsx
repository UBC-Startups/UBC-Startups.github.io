import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Card, Heading, Text } from "@/components/ui";
import type { EventRegistrationViewState } from "@/lib/events/registration-page-state";
import type { RegistrationStatus } from "@/lib/events/registration-result";
import styles from "./EventRegistration.module.css";

type EventRegistrationProps = {
  title: string;
  state: EventRegistrationViewState;
  /** Task 2 supplies the native registration form here when the event is open. */
  formSlot?: ReactNode;
};

const statusCopy: Record<
  RegistrationStatus,
  { heading: string; body: string }
> = {
  confirmed: {
    heading: "You’re registered",
    body: "Your place is confirmed. You don’t need to submit the form again.",
  },
  pending: {
    heading: "Application received",
    body: "Your application is pending review. You don’t need to submit it again.",
  },
  declined: {
    heading: "Application not accepted",
    body: "This application was not accepted. You don’t need to submit it again.",
  },
};

const stateCopy = {
  not_open: {
    heading: "Registration isn’t open yet",
    body: "Registration for this event hasn’t opened yet. Check back later.",
  },
  closed: {
    heading: "Registration is closed",
    body: "Registration for this event has closed.",
  },
  full: {
    heading: "Registration is full",
    body: "This event has reached its attendance capacity.",
  },
  unavailable: {
    heading: "Registration is unavailable",
    body: "Registration isn’t available for this event right now.",
  },
} as const;

function formatSubmittedAt(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "long",
    timeZone: "America/Vancouver",
  }).format(date);
}

function StatusCard({
  heading,
  body,
  submittedAt,
}: {
  heading: string;
  body: string;
  submittedAt?: string | null;
}) {
  return (
    <Card
      as="section"
      role="status"
      aria-labelledby="registration-state-heading"
      className="flex w-full flex-col gap-xs"
    >
      <Heading
        id="registration-state-heading"
        as="h2"
        variant="heading-m"
      >
        {heading}
      </Heading>
      <Text className="text-ink-secondary">{body}</Text>
      {submittedAt && (
        <Text as="p" variant="body-s" className="text-ink-secondary">
          Submitted {submittedAt}
        </Text>
      )}
    </Card>
  );
}

export function RegistrationReceipt({
  status,
  submittedAt,
}: {
  status: RegistrationStatus;
  submittedAt: string;
}) {
  return (
    <StatusCard
      heading={statusCopy[status].heading}
      body={statusCopy[status].body}
      submittedAt={formatSubmittedAt(submittedAt)}
    />
  );
}

export function EventRegistration({
  title,
  state,
  formSlot,
}: EventRegistrationProps) {
  return (
    <main id="main-content" className="min-h-screen bg-canvas">
      <div className="mx-auto box-border grid min-h-screen max-w-site gap-md p-md lg:grid-cols-[42%_1fr] lg:items-start">
        <section
          aria-labelledby="registration-event-title"
          className={[
            styles.brandPanel,
            "box-border flex min-h-[280px] flex-col justify-between gap-xxl rounded-panel bg-inverse p-lg text-ink-inverse sm:min-h-[340px] sm:p-xl lg:sticky lg:top-md lg:h-[calc(100dvh-32px)] lg:min-h-0 lg:self-start lg:p-xxl",
          ].join(" ")}
        >
          <Link
            href="/"
            className="flex w-fit items-center gap-xs text-ink-inverse no-underline"
          >
            <Image
              src="/figma/logo-mark-inverse.svg"
              alt=""
              width={34}
              height={34}
              className="block"
              preload
            />
            <Text as="span" variant="label-l" className="text-ink-inverse">
              UBC Startups
            </Text>
          </Link>

          <div className="flex max-w-[34ch] flex-col gap-sm">
            <Text as="span" variant="eyebrow" className="text-brand-green">
              Event registration
            </Text>
            <Heading
              id="registration-event-title"
              as="h1"
              variant="heading-xl"
              className="text-ink-inverse"
            >
              {title}
            </Heading>
            <Text className="text-ink-inverse-soft">
              Register for {title}. It’s a single submission, so review your
              answers before you send them.
            </Text>
          </div>
        </section>

        <div className="flex min-w-0 flex-col items-center py-sm lg:py-xl">
          <div className="flex w-full max-w-[440px] flex-col gap-lg">
            <Link
              href="/events"
              className="inline-flex w-fit items-center gap-xs font-brand text-label-s text-ink-secondary no-underline hover:text-ink"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 8H3m4-4L3 8l4 4" />
              </svg>
              Back to events
            </Link>

            <div className="flex flex-col gap-xs">
              <span
                aria-hidden="true"
                className="mb-xs block h-1 w-10 rounded-pill bg-brand-green"
              />
              <Text as="span" variant="eyebrow" className="text-accent">
                UBC Startups
              </Text>
              <Heading
                id="registration-form-heading"
                as="h2"
                variant="heading-xl"
                className="tracking-[-0.02em]"
                style={{ fontSize: "clamp(30px, 3vw, 36px)", lineHeight: 1.08 }}
              >
                Registration
              </Heading>
              {state.kind === "open" && (
                <Text className="text-ink-secondary">
                  Complete the form below. Your answers can’t be changed after
                  you submit.
                </Text>
              )}
            </div>

            {state.kind === "receipt" ? (
              <RegistrationReceipt
                status={state.status}
                submittedAt={state.submittedAt}
              />
            ) : state.kind === "open" ? (
              formSlot
            ) : (
              <StatusCard
                heading={stateCopy[state.kind].heading}
                body={stateCopy[state.kind].body}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
