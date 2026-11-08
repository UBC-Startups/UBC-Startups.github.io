import type { ReactNode } from "react";
import { Button, Card, Heading, PageContainer, Text } from "@/components/ui";
import type { EventRegistrationViewState } from "@/lib/events/registration-page-state";
import type { RegistrationStatus } from "@/lib/events/registration-result";

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
      className="flex max-w-[720px] flex-col gap-xs"
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
      <PageContainer className="flex min-h-screen flex-col gap-xl py-xxl">
        <Button href="/events" variant="secondary" className="self-start">
          Back to events
        </Button>
        <div className="flex max-w-[720px] flex-col gap-xs">
          <Text as="span" variant="eyebrow" className="text-accent">
            UBC Startups
          </Text>
          <Heading as="h1" variant="heading-xl">
            {title}
          </Heading>
        </div>

        {state.kind === "receipt" ? (
          <RegistrationReceipt
            status={state.status}
            submittedAt={state.submittedAt}
          />
        ) : state.kind === "open" ? (
          <Card
            as="section"
            aria-labelledby="registration-form-heading"
            className="flex max-w-[720px] flex-col gap-lg"
          >
            <div className="flex flex-col gap-xs">
              <Heading
                id="registration-form-heading"
                as="h2"
                variant="heading-m"
              >
                Registration
              </Heading>
              <Text className="text-ink-secondary">
                Registration is open for this event.
              </Text>
            </div>
            {formSlot}
          </Card>
        ) : (
          <StatusCard
            heading={stateCopy[state.kind].heading}
            body={stateCopy[state.kind].body}
          />
        )}
      </PageContainer>
    </main>
  );
}
