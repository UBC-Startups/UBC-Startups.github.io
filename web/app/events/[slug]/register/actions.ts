"use server";

import { getEventForm } from "@/data/event-forms";
import { readSignupAccount } from "@/lib/auth/basic-profile";
import type {
  RegistrationDraftSaveResult,
  RegistrationResult,
} from "@/lib/events/registration-result";
import {
  readEventRegistration,
  saveEventRegistrationDraftRecord,
  submitEventRegistrationRecord,
} from "@/lib/events/registration-server";
import { runRegistrationDraftSave } from "@/lib/events/save-registration-draft";
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

// Autosave callers invoke this directly rather than through a native form
// action, binding the slug and forwarding the revision they last observed.
export async function saveEventRegistrationDraft(
  slug: string,
  expectedRevision: number,
  data: FormData,
): Promise<RegistrationDraftSaveResult> {
  return runRegistrationDraftSave(slug, expectedRevision, data, {
    readAccount: readSignupAccount,
    readRegistration: readEventRegistration,
    getDefinition: getEventForm,
    saveRegistrationDraft: saveEventRegistrationDraftRecord,
  });
}
