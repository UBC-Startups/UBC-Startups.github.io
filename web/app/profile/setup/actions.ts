// Saves the signed-in user's first and last name, then continues to the destination.

"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseBasicProfile, saveBasicProfileRow } from "@/lib/auth/profile-setup";

export async function saveBasicProfile(_previousState: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const parsed = parseBasicProfile(formData);
  if ("error" in parsed) return { error: parsed.error };
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getClaims();
  if (authError || !data?.claims?.sub) redirect(`/sign-in?next=${encodeURIComponent(parsed.destination)}`);
  const result = await saveBasicProfileRow(supabase, data.claims.sub, parsed.firstName, parsed.lastName);
  if (result.error) return result;
  redirect(parsed.destination);
}
