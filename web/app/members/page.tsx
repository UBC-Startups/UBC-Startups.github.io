import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Loading from "@/app/loading";
import { readSignupAccount } from "@/lib/auth/basic-profile";
import { getMembersRedirect } from "@/lib/auth/signup-routing";
import { readMemberDirectory } from "@/lib/members/directory";
import Members from "@/views/Members";

export const metadata: Metadata = { title: "Members | UBC Startups" };

async function MembersGate() {
  await connection();
  const destination = getMembersRedirect(await readSignupAccount());
  if (destination) redirect(destination);
  return <Members members={await readMemberDirectory()} />;
}

export default function Page() {
  return <Suspense fallback={<Loading />}><MembersGate /></Suspense>;
}
