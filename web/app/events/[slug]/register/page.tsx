import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import Loading from "@/app/loading";
import { getEventForm } from "@/data/event-forms";
import { readSignupAccount } from "@/lib/auth/basic-profile";
import { getOnboardingPath } from "@/lib/auth/signup-routing";
import { resolveEventRegistrationPageState } from "@/lib/events/registration-page-state";
import { readEventRegistration } from "@/lib/events/registration-server";
import { EventRegistration } from "@/views/EventRegistration";

export const metadata: Metadata = {
  title: "Event registration | UBC Startups",
};

type RegisterPageProps = {
  params: Promise<{ slug: string }>;
};

async function Register({ params }: RegisterPageProps) {
  const { slug } = await params;
  await connection();

  // Keep the edition in the return destination so onboarding does not lose it.
  const registerPath = `/events/${slug}/register`;
  const account = await readSignupAccount();
  if (!account) {
    redirect(`/sign-in?next=${encodeURIComponent(registerPath)}`);
  }
  if (!account.profileComplete) {
    redirect(getOnboardingPath(registerPath, false));
  }

  const registration = await readEventRegistration(slug, account.userId);
  if (!registration) notFound();

  const form = getEventForm(slug);
  const state = resolveEventRegistrationPageState(registration, form);
  if (state.kind === "not_found") notFound();

  return (
    <EventRegistration
      title={form?.title ?? "Event registration"}
      state={state}
    />
  );
}

export default function Page(props: RegisterPageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <Register {...props} />
    </Suspense>
  );
}
