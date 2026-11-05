"use server";

import { getEventForm } from "@/data/event-forms";
import { readSignupAccount } from "@/lib/auth/basic-profile";
import type { RegistrationResult } from "@/lib/events/registration-result";
import {
  readEventRegistration,
  submitEventRegistrationRecord,
} from "@/lib/events/registration-server";
import { runRegistrationSubmission } from "@/lib/events/submit-registration";

export async function submitEventRegistration(
  slug: string,
  _previousState: RegistrationResult,
  data: FormData,
): Promise<RegistrationResult> {
  return runRegistrationSubmission(slug, data, {
    readAccount: readSignupAccount,
    readRegistration: readEventRegistration,
    getDefinition: getEventForm,
    now: () => new Date(),
    submitRegistration: submitEventRegistrationRecord,
  });
}
