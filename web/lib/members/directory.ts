import "server-only";
import { createClient } from "@/lib/supabase/server";
import { readAllDirectoryMembers } from "./directory-query";
import type { DirectoryMember } from "./search";

export async function readMemberDirectory(): Promise<DirectoryMember[]> {
  return readAllDirectoryMembers(await createClient());
}
