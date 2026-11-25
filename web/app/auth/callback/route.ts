// Exchanges the OAuth code, then redirects to profile setup or the saved destination.

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { readSignupAccount } from "@/lib/auth/basic-profile";
import { resolveSignupCallback } from "@/lib/auth/signup-routing";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const origin = process.env.APP_ORIGIN;
  if (!origin) throw new Error("APP_ORIGIN is required for Google sign-in");
  const destination = cookieStore.get("signup_destination")?.value;
  cookieStore.delete("signup_destination");
  const code = request.nextUrl.searchParams.get("code");
  const path = await resolveSignupCallback({
    destination,
    code,
    exchangeCode: async (value) => {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(value);
      return { error };
    },
    readAccount: readSignupAccount,
  });
  return NextResponse.redirect(new URL(path, origin));
}
