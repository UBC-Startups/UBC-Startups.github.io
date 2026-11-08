// Serializable result and read contracts shared by the Server Action and page.

export const registrationStatuses = [
  "draft",
  "pending",
  "confirmed",
  "declined",
] as const;
export type RegistrationStatus = (typeof registrationStatuses)[number];

export const submittedRegistrationStatuses = [
  "pending",
  "confirmed",
  "declined",
] as const;
export type SubmittedRegistrationStatus =
  (typeof submittedRegistrationStatuses)[number];

export const registrationAvailability = [
  "open",
  "not_open",
  "closed",
  "full",
  "not_found",
] as const;
export type RegistrationAvailability = (typeof registrationAvailability)[number];

export type RegistrationDraftAnswers = Record<string, string | string[]>;

export type RegistrationDraftSnapshot = {
  answers: RegistrationDraftAnswers;
  agreementKeys: string[];
};

export type RegistrationDraft = RegistrationDraftSnapshot & {
  revision: number;
  updatedAt: string;
};

export type EventRegistrationRead = {
  eventId: string;
  receipt: {
    status: SubmittedRegistrationStatus;
    submittedAt: string;
  } | null;
  draft?: RegistrationDraft | null;
  availability: RegistrationAvailability;
};

export type RegistrationResult =
  | { kind: "idle" }
  | {
      kind: "submitted";
      status: SubmittedRegistrationStatus;
      submittedAt: string;
    }
  | { kind: "invalid"; fieldErrors: Record<string, string> }
  | { kind: "sign_in_required" }
  | { kind: "profile_required" }
  | { kind: "not_open" }
  | { kind: "closed" }
  | { kind: "full" }
  | { kind: "conflict" }
  | { kind: "unavailable" }
  | { kind: "retry" };

export type RegistrationDraftSaveResult =
  | { kind: "saved"; revision: number; savedAt: string }
  | { kind: "conflict" }
  | {
      kind: "submitted";
      status: SubmittedRegistrationStatus;
      submittedAt: string;
    }
  | { kind: "invalid"; fieldErrors: Record<string, string> }
  | { kind: "sign_in_required" }
  | { kind: "profile_required" }
  | { kind: "not_open" }
  | { kind: "closed" }
  | { kind: "unavailable" }
  | { kind: "retry" };

export function isRegistrationStatus(
  value: unknown,
): value is RegistrationStatus {
  return (
    typeof value === "string" &&
    (registrationStatuses as ReadonlyArray<string>).includes(value)
  );
}

export function isSubmittedRegistrationStatus(
  value: unknown,
): value is SubmittedRegistrationStatus {
  return (
    typeof value === "string" &&
    (submittedRegistrationStatuses as ReadonlyArray<string>).includes(value)
  );
}

export function isRegistrationAvailability(
  value: unknown,
): value is RegistrationAvailability {
  return (
    typeof value === "string" &&
    (registrationAvailability as ReadonlyArray<string>).includes(value)
  );
}
