import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Card, Heading, PageContainer } from "@/components/ui";
import { readSignupAccount } from "@/lib/auth/basic-profile";
import { getSignupDestination } from "@/lib/auth/signup-routing";
import { ProfileForm } from "./profile-form";

async function Setup({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const destination = getSignupDestination((await searchParams).next);
  const account = await readSignupAccount();
  if (!account) redirect(`/sign-in?next=${encodeURIComponent(destination)}`);
  if (account.profileComplete) redirect(destination);

  return (
    <main id="main-content">
      <PageContainer className="py-xl">
        <Card className="flex flex-col gap-lg">
          <Heading as="h1" variant="heading-m">Set up your profile</Heading>
          <ProfileForm destination={destination} />
        </Card>
      </PageContainer>
    </main>
  );
}

export default function Page(props: { searchParams: Promise<{ next?: string }> }) {
  return <Suspense fallback={<p>Loading…</p>}><Setup {...props} /></Suspense>;
}
