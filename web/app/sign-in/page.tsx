import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Button, Card, Heading, PageContainer, Text } from "@/components/ui";
import { getOnboardingPath, getSignupDestination } from "@/lib/auth/signup-routing";
import { readSignupAccount } from "@/lib/auth/basic-profile";
import { startGoogleSignIn } from "./actions";

async function SignIn({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  const destination = getSignupDestination(params.next);
  const account = await readSignupAccount();
  if (account) redirect(getOnboardingPath(destination, account.profileComplete));

  return (
    <main id="main-content">
      <PageContainer className="py-xl">
        <Card className="flex flex-col gap-lg">
          <Heading as="h1" variant="heading-m">Sign in</Heading>
          {params.error && <Text role="alert">Sign-in could not be completed. Please try again.</Text>}
          <form action={startGoogleSignIn}>
            <input type="hidden" name="next" value={destination} />
            <Button type="submit">Continue with Google</Button>
          </form>
        </Card>
      </PageContainer>
    </main>
  );
}

export default function Page(props: { searchParams: Promise<{ next?: string; error?: string }> }) {
  return <Suspense fallback={<p>Loading…</p>}><SignIn {...props} /></Suspense>;
}
