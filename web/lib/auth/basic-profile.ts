// Reads the signed-in user and whether they have completed their basic profile.

import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function readSignupAccount(): Promise<{
  userId: string;
  profileComplete: boolean;
} | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error && error.name !== "AuthSessionMissingError") throw error;
  if (!data?.claims?.sub) return null;

  const userId = data.claims.sub;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (profileError) throw profileError;
  return { userId, profileComplete: profile !== null };
}
