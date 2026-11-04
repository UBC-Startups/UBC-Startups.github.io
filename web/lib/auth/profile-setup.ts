// Validates the profile setup form and saves the caller's basic profile.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
import { getSignupDestination } from "./signup-routing";

export type BasicProfileInput =
  | { destination: string; firstName: string; lastName: string }
  | { destination: string; error: string };

export function parseBasicProfile(formData: FormData): BasicProfileInput {
  const destination = getSignupDestination(formData.get("next")?.toString());
  const firstName = formData.get("first_name")?.toString().trim() ?? "";
  const lastName = formData.get("last_name")?.toString().trim() ?? "";

  if (!firstName || !lastName) {
    return { destination, error: "Enter your first and last name." };
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
