// Validates the profile setup form and saves the caller's basic profile.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
import { getSignupDestination } from "./signup-routing";

export type BasicProfileFieldErrors = {
  firstName?: string;
  lastName?: string;
};

export type BasicProfileInput = {
  destination: string;
  firstName: string;
  lastName: string;
  fieldErrors?: BasicProfileFieldErrors;
};

const MAX_NAME_CODE_POINTS = 100;

function exceedsNameLimit(name: string): boolean {
  return Array.from(name).length > MAX_NAME_CODE_POINTS;
}

export function parseBasicProfile(formData: FormData): BasicProfileInput {
  const destination = getSignupDestination(formData.get("next")?.toString());
  const firstName = formData.get("first_name")?.toString().trim() ?? "";
  const lastName = formData.get("last_name")?.toString().trim() ?? "";
  const fieldErrors: BasicProfileFieldErrors = {};

  if (!firstName) fieldErrors.firstName = "Enter your first name.";
  else if (exceedsNameLimit(firstName))
    fieldErrors.firstName = `First name must be ${MAX_NAME_CODE_POINTS} characters or fewer.`;
  if (!lastName) fieldErrors.lastName = "Enter your last name.";
  else if (exceedsNameLimit(lastName))
    fieldErrors.lastName = `Last name must be ${MAX_NAME_CODE_POINTS} characters or fewer.`;

  if (fieldErrors.firstName || fieldErrors.lastName) {
    return { destination, firstName, lastName, fieldErrors };
  }

  return { destination, firstName, lastName };
}

export async function saveBasicProfileRow(
  supabase: SupabaseClient<Database>,
  userId: string,
  firstName: string,
  lastName: string,
): Promise<{ error?: string }> {
  const { error } = await supabase.from("profiles").insert({
    user_id: userId,
    first_name: firstName,
    last_name: lastName,
  });

  if (!error) return {};
  if (error.code !== "23505") {
    return { error: "Could not save your profile. Please try again." };
  }

  const existing = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing.error || !existing.data) {
    return { error: "Could not save your profile. Please try again." };
  }

  return {};
}
