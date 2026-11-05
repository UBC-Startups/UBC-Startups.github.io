// Runs the trusted registration workflow with injectable I/O for tests.

import type {
  AcceptedAgreement,
  EventForm,
  RegistrationAnswers,
} from "./form-definition";
import {
  isRegistrationStatus,
  type EventRegistrationRead,
  type RegistrationResult,
} from "./registration-result";
import { validateRegistration } from "./validate-registration";

export type RegistrationSubmissionInput = {
  eventId: string;
  userId: string;
  answers: RegistrationAnswers;
  acceptedAgreements: AcceptedAgreement[];
};

export type RegistrationSubmissionOutcome = {
  outcome: string;
  status: string | null;
  submittedAt: string | null;
};

export type RegistrationSubmissionDependencies = {
  readAccount: () => Promise<{
    userId: string;
    profileComplete: boolean;
  } | null>;
  readRegistration: (
    slug: string,
    userId: string,
  ) => Promise<EventRegistrationRead | null>;
  getDefinition: (slug: string) => EventForm | undefined;
  now: () => Date;
  submitRegistration: (
    input: RegistrationSubmissionInput,
  ) => Promise<RegistrationSubmissionOutcome>;
};

function mapSubmissionOutcome(
  outcome: RegistrationSubmissionOutcome,
): RegistrationResult {
  switch (outcome.outcome) {
    case "saved":
      if (
        !isRegistrationStatus(outcome.status) ||
        typeof outcome.submittedAt !== "string" ||
        outcome.submittedAt.length === 0
      ) {
        return { kind: "retry" };
      }
      return {
        kind: "submitted",
        status: outcome.status,
        submittedAt: outcome.submittedAt,
      };
    case "not_open":
      return { kind: "not_open" };
    case "closed":
      return { kind: "closed" };
    case "full":
      return { kind: "full" };
    case "not_found":
      return { kind: "unavailable" };
    case "profile_required":
      return { kind: "profile_required" };
    default:
      return { kind: "retry" };
  }
}

export async function runRegistrationSubmission(
  slug: string,
  data: FormData,
  dependencies: RegistrationSubmissionDependencies,
): Promise<RegistrationResult> {
  try {
    const account = await dependencies.readAccount();
    if (!account) return { kind: "sign_in_required" };

    const registration = await dependencies.readRegistration(
      slug,
      account.userId,
    );
    if (!registration) return { kind: "unavailable" };

    // A saved receipt is the attendee's durable result, even after closure or
    // when the edition's definition is no longer available.
    if (registration.receipt) {
      return {
        kind: "submitted",
        status: registration.receipt.status,
        submittedAt: registration.receipt.submittedAt,
      };
    }

    if (!account.profileComplete) return { kind: "profile_required" };

    const definition = dependencies.getDefinition(slug);
    if (!definition) return { kind: "unavailable" };

    // Preflight availability is advisory only. The locked RPC checks for an
    // existing receipt before deciding on the window or capacity, so a
    // concurrent same-account submission must not be rejected from a stale
    // full, closed, or not_open read.
    const acceptedAt = dependencies.now().toISOString();
    const validation = validateRegistration(definition, data, acceptedAt);
    if (!validation.ok) {
      return { kind: "invalid", fieldErrors: validation.fieldErrors };
    }

    const outcome = await dependencies.submitRegistration({
      eventId: registration.eventId,
      userId: account.userId,
      answers: validation.answers,
      acceptedAgreements: validation.acceptedAgreements,
    });

    return mapSubmissionOutcome(outcome);
  } catch {
    return { kind: "retry" };
  }
}
