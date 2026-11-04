// Starts Google sign-in and remembers the validated return destination.

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSignupDestination } from "@/lib/auth/signup-routing";

export async function startGoogleSignIn(formData: FormData): Promise<void> {
  const destination = getSignupDestination(formData.get("next")?.toString());
  const origin = process.env.APP_ORIGIN;
  if (!origin) throw new Error("APP_ORIGIN is required for Google sign-in");

  const callback = new URL("/auth/callback", origin);
  const cookieStore = await cookies();
  cookieStore.set("signup_destination", destination, {
    httpOnly: true,
    sameSite: "lax",
    secure: callback.protocol === "https:",
    path: "/",
    maxAge: 600,
  });

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString() },
  });
  if (error || !data.url) {
    redirect(`/sign-in?next=${encodeURIComponent(destination)}&error=oauth`);
  }
  redirect(data.url);
}
