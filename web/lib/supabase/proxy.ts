import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next();

  // The migrated public website still works without a configured backend.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return response;
  }

  const { url, key } = getSupabaseEnv();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        const previousResponse = response;
        response = NextResponse.next({ request });
        // Retain earlier writes if the SDK sets cookies more than once.
        previousResponse.cookies.getAll().forEach(cookie => response.cookies.set(cookie));
        for (const header of ["cache-control", "expires", "pragma"]) {
          const value = previousResponse.headers.get(header);
          if (value) response.headers.set(header, value);
        }
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });

  // Creating a client alone does not refresh sessions. Verify immediately,
  // before returning the response that carries the updated cookies.
  await supabase.auth.getClaims();

  // This refreshes sessions only. Features must enforce identity, permissions,
  // and RLS themselves; public visitors are not redirected to a login page.
  return response;
}
