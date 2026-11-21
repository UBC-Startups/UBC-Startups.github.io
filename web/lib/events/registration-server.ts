// Request-scoped registration reads and the narrow server-only RPC client.

import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  isRegistrationAvailability,
  isRegistrationStatus,
  isSubmittedRegistrationStatus,
  type EventRegistrationRead,
  type RegistrationDraft,
  type RegistrationDraftAnswers,
} from "./registration-result";
import type {
  RegistrationDraftSaveInput,
  RegistrationDraftSaveOutcome,
} from "./save-registration-draft";
import type {
  RegistrationSubmissionInput,
  RegistrationSubmissionOutcome,
} from "./submit-registration";
import type { Database } from "../supabase/database.types";
import { createClient } from "../supabase/server";

function createPrivilegedClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in web/.env.local before submitting event registrations.",
    );
  }

  return createSupabaseClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

async function readAvailability(
  eventId: string,
): Promise<EventRegistrationRead["availability"]> {
  const supabase = createPrivilegedClient();
  const { data, error } = await supabase.rpc(
    "get_event_registration_availability",
    { p_event_id: eventId },
  );
  if (error) throw error;

  const outcome = data?.[0]?.outcome;
  if (!isRegistrationAvailability(outcome)) {
    throw new Error("Event registration availability is unavailable.");
  }
  return outcome;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readDraftAnswers(value: unknown): RegistrationDraftAnswers | null {
  if (!isPlainObject(value)) return null;

  const entries: Array<[string, string | string[]]> = [];
  for (const [key, answer] of Object.entries(value)) {
    if (typeof answer === "string") {
      entries.push([key, answer]);
      continue;
    }
    if (
      Array.isArray(answer) &&
      answer.every((entry) => typeof entry === "string")
    ) {
      entries.push([key, answer as string[]]);
      continue;
    }
    return null;
  }

  return Object.fromEntries(entries) as RegistrationDraftAnswers;
}

function readAgreementKeys(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  if (!value.every((entry) => typeof entry === "string")) return null;
  if (new Set(value).size !== value.length) return null;
  return value as string[];
}

function readDraft(row: {
  answers: unknown;
  draft_agreement_keys: unknown;
  revision: unknown;
  updated_at: unknown;
}): RegistrationDraft {
  const answers = readDraftAnswers(row.answers);
  const agreementKeys = readAgreementKeys(row.draft_agreement_keys);

  if (
    !answers ||
    !agreementKeys ||
    typeof row.revision !== "number" ||
    !Number.isSafeInteger(row.revision) ||
    row.revision < 0 ||
    typeof row.updated_at !== "string" ||
    row.updated_at.length === 0
  ) {
    throw new Error("Event registration draft is unavailable.");
  }

  return {
    answers,
    agreementKeys,
    revision: row.revision,
    updatedAt: row.updated_at,
  };
}

export async function readEventRegistration(
  slug: string,
  userId: string,
): Promise<EventRegistrationRead | null> {
  const supabase = await createClient();
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (eventError) throw eventError;
  if (!event) return null;

  const { data: registration, error: registrationError } = await supabase
    .from("event_registrations")
    .select(
      "status, submitted_at, answers, draft_agreement_keys, revision, updated_at",
    )
    .eq("event_id", event.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (registrationError) throw registrationError;

  if (registration) {
    if (!isRegistrationStatus(registration.status)) {
      throw new Error("Event registration status is unavailable.");
    }

    // A draft is working progress, not a receipt. Read it before the terminal
    // branch and report the event's actual availability so the page can decide
    // whether saving or resuming is still allowed.
    if (registration.status === "draft") {
      return {
        eventId: event.id,
        receipt: null,
        draft: readDraft(registration),
        availability: await readAvailability(event.id),
      };
    }

    if (!isSubmittedRegistrationStatus(registration.status)) {
      throw new Error("Event registration status is unavailable.");
    }
    if (!registration.submitted_at) {
      throw new Error("Event registration submission timestamp is unavailable.");
    }
    return {
      eventId: event.id,
      receipt: {
        status: registration.status,
        submittedAt: registration.submitted_at,
      },
      // A saved receipt takes precedence over availability, so the privileged
      // availability RPC is skipped and this placeholder is not shown.
      availability: "open",
    };
  }

  return {
    eventId: event.id,
    receipt: null,
    draft: null,
    availability: await readAvailability(event.id),
  };
}

export async function submitEventRegistrationRecord(
  input: RegistrationSubmissionInput,
): Promise<RegistrationSubmissionOutcome> {
  const supabase = createPrivilegedClient();
  const { data, error } = await supabase.rpc("submit_event_registration", {
    p_event_id: input.eventId,
    p_user_id: input.userId,
    p_answers: input.answers,
    p_accepted_agreements: input.acceptedAgreements.map(
      ({ key, text, accepted_at }) => ({ key, text, accepted_at }),
    ),
    ...(input.expectedRevision === undefined
      ? {}
      : { p_expected_revision: input.expectedRevision }),
  });
  if (error) throw error;

  const row = data?.[0];
  if (!row) throw new Error("Event registration submission is unavailable.");

  return {
    outcome: row.outcome,
    status: row.status,
    submittedAt: row.submitted_at,
  };
}

export async function saveEventRegistrationDraftRecord(
  input: RegistrationDraftSaveInput,
): Promise<RegistrationDraftSaveOutcome> {
  const supabase = createPrivilegedClient();
  const { data, error } = await supabase.rpc("save_event_registration_draft", {
    p_event_id: input.eventId,
    p_user_id: input.userId,
    p_answers: input.answers,
    p_agreement_keys: input.agreementKeys,
    p_expected_revision: input.expectedRevision,
  });
  if (error) throw error;

  const row = data?.[0];
  if (!row) throw new Error("Event registration draft save is unavailable.");

  return {
    outcome: row.outcome,
    revision: row.revision,
    savedAt: row.saved_at,
    status: row.status,
    submittedAt: row.submitted_at,
  };
}
