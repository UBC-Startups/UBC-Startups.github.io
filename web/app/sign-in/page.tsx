import Image from "next/image";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Loading from "@/app/loading";
import { Button, Card, Heading, PageContainer, Text } from "@/components/ui";
import { getOnboardingPath, getSignupDestination } from "@/lib/auth/signup-routing";
import { readSignupAccount } from "@/lib/auth/basic-profile";
import { startGoogleSignIn } from "./actions";

async function SignIn({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  await connection();
  const params = await searchParams;
  const destination = getSignupDestination(params.next);
  const account = await readSignupAccount();
  if (account) redirect(getOnboardingPath(destination, account.profileComplete));

  return (
    <main id="main-content" className="min-h-screen bg-canvas">
      <PageContainer className="flex min-h-screen items-center justify-center py-xl">
        <Card className="mx-auto flex w-full max-w-[420px] flex-col gap-lg">
          <div className="flex items-center justify-center gap-xs">
            <Image src="/figma/logo-mark.svg" alt="" width={34} height={34} className="block" preload />
            <Text as="span" className="text-brand">UBC Startups</Text>
          </div>
          <div className="flex flex-col gap-xs text-center">
            <Heading as="h1" variant="heading-m">Sign in</Heading>
            <Text className="text-ink-secondary">Use your Google account to continue to UBC Startups.</Text>
          </div>
          {params.error && <Text role="alert" className="rounded-field border-l-2 border-solid border-brand-red bg-canvas px-md py-sm text-ink">Sign-in could not be completed. Please try again.</Text>}
          <form action={startGoogleSignIn} className="flex flex-col">
            <input type="hidden" name="next" value={destination} />
            <Button type="submit" className="w-full">Continue with Google</Button>
          </form>
        </Card>
      </PageContainer>
    </main>
  );
}

export default function Page(props: { searchParams: Promise<{ next?: string; error?: string }> }) {
  return <Suspense fallback={<Loading />}><SignIn {...props} /></Suspense>;
}
