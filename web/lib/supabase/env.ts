export function getSupabaseEnv() {
  // Keep direct property access so Next.js can inline public browser values.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in web/.env.local before using Supabase.",
    );
  }

  return { url, key };
}
