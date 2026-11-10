import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { DirectoryMember } from "./search";

export async function readMemberDirectory(): Promise<DirectoryMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, first_name, last_name")
    .order("first_name")
    .order("last_name");
  if (error) throw error;
  return data.map(row => ({ id: row.user_id, firstName: row.first_name, lastName: row.last_name }));
}
