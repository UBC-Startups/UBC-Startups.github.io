// Saves the signed-in user's first and last name, then continues to the destination.

"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  parseBasicProfile,
  saveBasicProfileRow,
  type BasicProfileFieldErrors,
} from "@/lib/auth/profile-setup";

type BasicProfileFormState = {
  error?: string;
  fieldErrors?: BasicProfileFieldErrors;
};

export async function saveBasicProfile(
  _previousState: BasicProfileFormState,
  formData: FormData,
): Promise<BasicProfileFormState> {
  const parsed = parseBasicProfile(formData);
  if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getClaims();
  if (authError || !data?.claims?.sub) redirect(`/sign-in?next=${encodeURIComponent(parsed.destination)}`);
  const result = await saveBasicProfileRow(supabase, data.claims.sub, parsed.firstName, parsed.lastName);
  if (result.error) return result;
  redirect(parsed.destination);
}
