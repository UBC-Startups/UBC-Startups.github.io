import { Card, Heading, Text } from "@/components/ui";
import type { SubmittedRegistrationStatus } from "@/lib/events/registration-result";

export const statusCopy: Record<
  SubmittedRegistrationStatus,
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

export const stateCopy = {
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

export function StatusCard({
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
      <Heading id="registration-state-heading" as="h2" variant="heading-m">
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
  status: SubmittedRegistrationStatus;
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
