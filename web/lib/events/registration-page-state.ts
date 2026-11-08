// Maps a registration read and optional fixed form to the page's render state.

import type { EventForm } from "./form-definition";
import type {
  EventRegistrationRead,
  RegistrationStatus,
} from "./registration-result";

export type EventRegistrationViewState =
  | { kind: "open"; form: EventForm }
  | { kind: "receipt"; status: RegistrationStatus; submittedAt: string }
  | { kind: "not_open" }
  | { kind: "closed" }
  | { kind: "full" }
  | { kind: "unavailable" };

export type EventRegistrationPageState =
  | EventRegistrationViewState
  | { kind: "not_found" };

export function resolveEventRegistrationPageState(
  registration: EventRegistrationRead,
  form: EventForm | undefined,
): EventRegistrationPageState {
  // An attendee's own saved receipt wins over the window, capacity, and a
  // definition that has since been removed.
  if (registration.receipt) {
    return {
      kind: "receipt",
      status: registration.receipt.status,
      submittedAt: registration.receipt.submittedAt,
    };
  }

  if (registration.availability === "not_found") return { kind: "not_found" };

  // An open event without a committed definition must never render a form.
  if (registration.availability === "open") {
    return form ? { kind: "open", form } : { kind: "unavailable" };
  }

  return { kind: registration.availability };
}
