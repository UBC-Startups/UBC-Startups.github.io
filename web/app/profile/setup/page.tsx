import Image from "next/image";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Card, Heading, PageContainer, Text } from "@/components/ui";
import { readSignupAccount } from "@/lib/auth/basic-profile";
import { getSignupDestination } from "@/lib/auth/signup-routing";
import { ProfileForm } from "./profile-form";

async function Setup({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  await connection();
  const destination = getSignupDestination((await searchParams).next);
  const account = await readSignupAccount();
  if (!account) redirect(`/sign-in?next=${encodeURIComponent(destination)}`);
  if (account.profileComplete) redirect(destination);

  return (
    <main id="main-content" className="min-h-screen bg-canvas">
      <PageContainer className="flex min-h-screen items-center justify-center py-xl">
        <Card className="mx-auto flex w-full max-w-[420px] flex-col gap-lg">
          <div className="flex items-center justify-center gap-xs">
            <Image src="/figma/logo-mark.svg" alt="" width={34} height={34} className="block" preload />
            <Text as="span" className="text-brand">UBC Startups</Text>
          </div>
          <div className="flex flex-col gap-xs text-center">
            <Heading as="h1" variant="heading-m">Set up your profile</Heading>
            <Text className="text-ink-secondary">Add your name to finish setting up your UBC Startups account.</Text>
          </div>
          <ProfileForm destination={destination} />
        </Card>
      </PageContainer>
    </main>
  );
}

export default function Page(props: { searchParams: Promise<{ next?: string }> }) {
  return <Suspense fallback={<p>Loading…</p>}><Setup {...props} /></Suspense>;
}
