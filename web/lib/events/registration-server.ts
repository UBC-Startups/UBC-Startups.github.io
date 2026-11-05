// Request-scoped registration reads and the narrow server-only RPC client.

import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  isRegistrationAvailability,
  isRegistrationStatus,
  type EventRegistrationRead,
} from "./registration-result";
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

  const { data: receipt, error: receiptError } = await supabase
    .from("event_registrations")
    .select("status, submitted_at")
    .eq("event_id", event.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (receiptError) throw receiptError;

  if (receipt) {
    if (!isRegistrationStatus(receipt.status)) {
      throw new Error("Event registration status is unavailable.");
    }
    return {
      eventId: event.id,
      receipt: {
        status: receipt.status,
        submittedAt: receipt.submitted_at,
      },
      // A saved receipt takes precedence over availability, so the privileged
      // availability RPC is skipped and this placeholder is not shown.
      availability: "open",
    };
  }

  return {
    eventId: event.id,
    receipt: null,
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
