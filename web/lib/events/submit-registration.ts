// Runs the trusted registration workflow with injectable I/O for tests.

import type {
  AcceptedAgreement,
  EventForm,
  RegistrationAnswers,
} from "./form-definition";
import {
  isSubmittedRegistrationStatus,
  type EventRegistrationRead,
  type RegistrationResult,
} from "./registration-result";
import { validateRegistration } from "./validate-registration";

export type RegistrationSubmissionInput = {
  eventId: string;
  userId: string;
  answers: RegistrationAnswers;
  acceptedAgreements: AcceptedAgreement[];
  /** Present only when the client is promoting an autosaved draft. */
  expectedRevision?: number;
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

const DRAFT_REVISION_FIELD = "draft_revision";
const DRAFT_REVISION_MESSAGE = "Reload the page and try submitting again.";
const DRAFT_REVISION_PATTERN = /^\d+$/;

function readExpectedRevision(
  data: FormData,
): { ok: true; value: number | undefined } | { ok: false } {
  const values = data.getAll(DRAFT_REVISION_FIELD);
  if (values.length === 0) return { ok: true, value: undefined };
  if (values.length > 1) return { ok: false };

  const value = values[0];
  if (typeof value !== "string" || !DRAFT_REVISION_PATTERN.test(value)) {
    return { ok: false };
  }

  const revision = Number(value);
  if (!Number.isSafeInteger(revision) || revision < 0) {
    return { ok: false };
  }

  return { ok: true, value: revision };
}

function mapSubmissionOutcome(
  outcome: RegistrationSubmissionOutcome,
): RegistrationResult {
  switch (outcome.outcome) {
    case "saved":
      if (
        !isSubmittedRegistrationStatus(outcome.status) ||
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
    case "conflict":
      return { kind: "conflict" };
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

    const expectedRevision = readExpectedRevision(data);
    if (!expectedRevision.ok) {
      return {
        kind: "invalid",
        fieldErrors: { [DRAFT_REVISION_FIELD]: DRAFT_REVISION_MESSAGE },
      };
    }

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
      ...(expectedRevision.value === undefined
        ? {}
        : { expectedRevision: expectedRevision.value }),
    });

    return mapSubmissionOutcome(outcome);
  } catch {
    return { kind: "retry" };
  }
}
