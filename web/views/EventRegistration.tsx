import Image from "next/image";
import Link from "next/link";
import { Heading, Text } from "@/components/ui";
import type { EventForm } from "@/lib/events/form-definition";
import type { EventRegistrationViewState } from "@/lib/events/registration-page-state";
import type {
  RegistrationDraft,
  RegistrationDraftSaveResult,
  RegistrationResult,
} from "@/lib/events/registration-result";
import styles from "./EventRegistration.module.css";
import {
  RegistrationReceipt,
  StatusCard,
  stateCopy,
} from "./registration/RegistrationReceipt";
import { EventRegistrationForm } from "./registration/EventRegistrationForm";

type EventRegistrationProps = {
  title: string;
  blurb?: string;
  state: EventRegistrationViewState;
  registrationForm?: {
    definition: EventForm;
    slug: string;
    initialDraft?: RegistrationDraft;
    action: (
      state: RegistrationResult,
      data: FormData,
    ) => Promise<RegistrationResult>;
    saveDraftAction: (
      expectedRevision: number,
      data: FormData,
    ) => Promise<RegistrationDraftSaveResult>;
  };
};

export function EventRegistration({
  title,
  blurb,
  state,
  registrationForm,
}: EventRegistrationProps) {
  return (
    <main id="main-content" className="min-h-screen bg-canvas">
      <div className="mx-auto box-border grid min-h-[100dvh] max-w-site content-start gap-md p-md sm:max-w-[800px] lg:h-[100dvh] lg:min-h-0 lg:max-w-site lg:grid-cols-[42%_1fr] lg:items-stretch lg:content-normal">
        <section
          aria-labelledby="registration-event-title"
          className={[
            styles.brandPanel,
            "box-border flex min-h-[280px] flex-col justify-between gap-xxl rounded-panel bg-inverse p-lg text-ink-inverse sm:min-h-0 sm:flex-row sm:items-center sm:gap-xl sm:p-xl lg:h-full lg:min-h-0 lg:flex-col lg:items-stretch lg:justify-between lg:gap-xxl lg:p-xxl",
          ].join(" ")}
        >
          <Link
            href="/"
            className="flex w-fit shrink-0 items-center gap-xs text-ink-inverse no-underline"
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

          <div className="flex min-w-0 max-w-[34ch] flex-col gap-sm">
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
            {state.kind === "open" && blurb && (
              <Text className="text-ink-inverse-soft">{blurb}</Text>
            )}
          </div>
        </section>

        <div className="flex min-w-0 flex-col items-center py-sm lg:h-full lg:min-h-0 lg:justify-start lg:py-0">
          <div className="flex w-full max-w-[440px] flex-col gap-lg sm:max-w-[640px] lg:h-full lg:min-h-0 lg:max-w-[440px] lg:gap-md">
            <Link
              href="/events"
              className="inline-flex w-fit shrink-0 items-center gap-xs font-brand text-label-s text-ink-secondary no-underline hover:text-ink"
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

            <div className="flex shrink-0 flex-col gap-xs">
              <span
                aria-hidden="true"
                className="mb-xs block h-1 w-10 rounded-pill bg-brand-green"
              />
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
            ) : state.kind === "open" && registrationForm ? (
              <EventRegistrationForm
                key={registrationForm.slug}
                {...registrationForm}
              />
            ) : state.kind === "open" ? (
              <StatusCard
                heading={stateCopy.unavailable.heading}
                body={stateCopy.unavailable.body}
              />
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
