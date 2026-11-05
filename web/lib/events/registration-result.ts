// Serializable result and read contracts shared by the Server Action and page.

export const registrationStatuses = ["pending", "confirmed", "declined"] as const;
export type RegistrationStatus = (typeof registrationStatuses)[number];

export const registrationAvailability = [
  "open",
  "not_open",
  "closed",
  "full",
  "not_found",
] as const;
export type RegistrationAvailability = (typeof registrationAvailability)[number];

export type EventRegistrationRead = {
  eventId: string;
  receipt: {
    status: RegistrationStatus;
    submittedAt: string;
  } | null;
  availability: RegistrationAvailability;
};

export type RegistrationResult =
  | { kind: "idle" }
  | { kind: "submitted"; status: RegistrationStatus; submittedAt: string }
  | { kind: "invalid"; fieldErrors: Record<string, string> }
  | { kind: "sign_in_required" }
  | { kind: "profile_required" }
  | { kind: "not_open" }
  | { kind: "closed" }
  | { kind: "full" }
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

export function isRegistrationAvailability(
  value: unknown,
): value is RegistrationAvailability {
  return (
    typeof value === "string" &&
    (registrationAvailability as ReadonlyArray<string>).includes(value)
  );
}
