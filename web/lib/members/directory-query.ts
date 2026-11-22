// Reads every directory profile in pages, because the API caps each response (max_rows).

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
import type { DirectoryMember } from "./search";

const PAGE_SIZE = 1000;

export async function readAllDirectoryMembers(supabase: SupabaseClient<Database>): Promise<DirectoryMember[]> {
  const members: DirectoryMember[] = [];
  for (;;) {
    const { data, error, count } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name", { count: "exact" })
      .order("first_name")
      .order("last_name")
      .order("user_id")
      .range(members.length, members.length + PAGE_SIZE - 1);
    if (error) throw error;
    members.push(...data.map(row => ({ id: row.user_id, firstName: row.first_name, lastName: row.last_name })));
    if (!data.length || (count !== null && members.length >= count)) return members;
  }
}
