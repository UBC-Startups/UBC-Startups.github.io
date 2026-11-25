// Runs the trusted draft-save workflow with injectable I/O for tests.

import type { EventForm } from "./form-definition";
import {
  isSubmittedRegistrationStatus,
  type EventRegistrationRead,
  type RegistrationDraftSaveResult,
} from "./registration-result";
import { validateRegistrationDraft } from "./validate-registration";

export type RegistrationDraftSaveInput = {
  eventId: string;
  userId: string;
  answers: Record<string, string | string[]>;
  agreementKeys: string[];
  expectedRevision: number;
};

export type RegistrationDraftSaveOutcome = {
  outcome: string;
  revision: number | null;
  savedAt: string | null;
  status: string | null;
  submittedAt: string | null;
};

export type RegistrationDraftSaveDependencies = {
  readAccount: () => Promise<{
    userId: string;
    profileComplete: boolean;
  } | null>;
  readRegistration: (
    slug: string,
    userId: string,
  ) => Promise<EventRegistrationRead | null>;
  getDefinition: (slug: string) => EventForm | undefined;
  saveRegistrationDraft: (
    input: RegistrationDraftSaveInput,
  ) => Promise<RegistrationDraftSaveOutcome>;
};

const DRAFT_REVISION_FIELD = "draft_revision";
const DRAFT_REVISION_MESSAGE = "Reload the page and try saving again.";
const DRAFT_REJECTED_FIELD = "draft";
const DRAFT_REJECTED_MESSAGE =
  "This draft could not be saved. Review your answers and try again.";

function isExpectedRevision(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

function mapDraftSaveOutcome(
  outcome: RegistrationDraftSaveOutcome,
): RegistrationDraftSaveResult {
  switch (outcome.outcome) {
    case "saved":
      if (
        typeof outcome.revision !== "number" ||
        !Number.isSafeInteger(outcome.revision) ||
        outcome.revision < 1 ||
        typeof outcome.savedAt !== "string" ||
        outcome.savedAt.length === 0
      ) {
        return { kind: "retry" };
      }
      return {
        kind: "saved",
        revision: outcome.revision,
        savedAt: outcome.savedAt,
      };
    case "conflict":
      return { kind: "conflict" };
    case "submitted":
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
    case "invalid_payload":
      return {
        kind: "invalid",
        fieldErrors: { [DRAFT_REJECTED_FIELD]: DRAFT_REJECTED_MESSAGE },
      };
    case "not_found":
      return { kind: "unavailable" };
    case "profile_required":
      return { kind: "profile_required" };
    case "not_open":
      return { kind: "not_open" };
    case "closed":
      return { kind: "closed" };
    default:
      return { kind: "retry" };
  }
}

export async function runRegistrationDraftSave(
  slug: string,
  expectedRevision: number,
  data: FormData,
  dependencies: RegistrationDraftSaveDependencies,
): Promise<RegistrationDraftSaveResult> {
  if (!isExpectedRevision(expectedRevision)) {
    return {
      kind: "invalid",
      fieldErrors: { [DRAFT_REVISION_FIELD]: DRAFT_REVISION_MESSAGE },
    };
  }

  try {
    const account = await dependencies.readAccount();
    if (!account) return { kind: "sign_in_required" };

    const registration = await dependencies.readRegistration(
      slug,
      account.userId,
    );
    if (!registration) return { kind: "unavailable" };

    // A terminal receipt is the attendee's durable result. A late autosave
    // must return it instead of writing a draft, even after closure or when
    // the edition's definition is no longer available.
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

    // Availability is intentionally not preflighted here: drafts never hold
    // seats, and the RPC remains authoritative for the window and revision.
    const validation = validateRegistrationDraft(definition, data);
    if (!validation.ok) {
      return { kind: "invalid", fieldErrors: validation.fieldErrors };
    }

    const outcome = await dependencies.saveRegistrationDraft({
      eventId: registration.eventId,
      userId: account.userId,
      answers: validation.answers,
      agreementKeys: validation.agreementKeys,
      expectedRevision,
    });

    return mapDraftSaveOutcome(outcome);
  } catch {
    return { kind: "retry" };
  }
}
