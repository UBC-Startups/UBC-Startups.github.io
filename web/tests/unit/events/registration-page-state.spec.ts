import { expect, test } from "@playwright/test";
import type { EventForm } from "../../../lib/events/form-definition";
import {
  resolveEventRegistrationPageState,
  type EventRegistrationPageState,
} from "../../../lib/events/registration-page-state";
import type {
  EventRegistrationRead,
  RegistrationStatus,
} from "../../../lib/events/registration-result";

const eventId = "22222222-2222-4222-8222-222222222222";
const submittedAt = "2026-11-01T12:00:00.000Z";

const form: EventForm = {
  title: "CaseHack",
  questions: [],
  agreements: [],
};

function registration(
  overrides: Partial<EventRegistrationRead> = {},
): EventRegistrationRead {
  return {
    eventId,
    receipt: null,
    availability: "open",
    ...overrides,
  };
}

function receiptState(
  status: RegistrationStatus,
): EventRegistrationPageState {
  return { kind: "receipt", status, submittedAt };
}

test("an own receipt wins over availability and a missing definition", () => {
  const statuses: RegistrationStatus[] = ["pending", "confirmed", "declined"];
  const availabilityStates: EventRegistrationRead["availability"][] = [
    "open",
    "not_open",
    "closed",
    "full",
    "not_found",
  ];

  for (const status of statuses) {
    for (const availability of availabilityStates) {
      expect(
        resolveEventRegistrationPageState(
          registration({
            receipt: { status, submittedAt },
            availability,
          }),
          undefined,
        ),
      ).toEqual(receiptState(status));
    }
  }
});

test("an open event needs a committed definition before rendering its form", () => {
  expect(resolveEventRegistrationPageState(registration(), form)).toEqual({
    kind: "open",
    form,
  });
  expect(resolveEventRegistrationPageState(registration(), undefined)).toEqual({
    kind: "unavailable",
  });
});

test("maps non-receipt availability and missing editions", () => {
  expect(
    resolveEventRegistrationPageState(
      registration({ availability: "not_found" }),
      undefined,
    ),
  ).toEqual({ kind: "not_found" });

  for (const availability of ["not_open", "closed", "full"] as const) {
    expect(
      resolveEventRegistrationPageState(
        registration({ availability }),
        form,
      ),
    ).toEqual({ kind: availability });
  }
});
