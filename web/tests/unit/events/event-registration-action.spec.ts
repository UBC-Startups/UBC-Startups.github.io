import { expect, test } from "@playwright/test";
import type { EventForm } from "../../../lib/events/form-definition";
import type {
  EventRegistrationRead,
  RegistrationResult,
} from "../../../lib/events/registration-result";
import {
  runRegistrationSubmission,
  type RegistrationSubmissionDependencies,
  type RegistrationSubmissionInput,
} from "../../../lib/events/submit-registration";

const slug = "casehack-2026";
const userId = "11111111-1111-4111-8111-111111111111";
const eventId = "22222222-2222-4222-8222-222222222222";
const savedAt = "2026-11-01T12:00:00.000Z";
const clock = new Date("2026-11-05T12:00:00.000Z");
const clockIso = clock.toISOString();

const definition: EventForm = {
  title: "Test event",
  questions: [
    {
      id: "name",
      kind: "text",
      label: "Name",
      required: true,
      maxLength: 40,
    },
    {
      id: "topics",
      kind: "multiselect",
      label: "Topics",
      required: true,
      exclusiveValues: ["none"],
      choices: [
        { value: "none", label: "None" },
        { value: "ai", label: "AI" },
        { value: "web", label: "Web" },
        { value: "other", label: "Other" },
      ],
    },
    {
      id: "details",
      kind: "text",
      label: "Details",
      required: false,
      maxLength: 80,
      requiredWhen: {
        questionId: "topics",
        includesAny: ["other"],
      },
    },
  ],
  agreements: [
    {
      id: "terms",
      label: "Terms",
      text: "Trusted terms",
      required: true,
    },
  ],
};

const openRegistration: EventRegistrationRead = {
  eventId,
  receipt: null,
  availability: "open",
};

function form(fields: Record<string, string | string[]>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    for (const entry of Array.isArray(value) ? value : [value]) {
      data.append(key, entry);
    }
  }
  return data;
}

function validFields(
  overrides: Record<string, string | string[]> = {},
): Record<string, string | string[]> {
  return {
    "question:name": "  Ada  ",
    "question:topics": ["ai", "web"],
    "agreement:terms": "yes",
    ...overrides,
  };
}

function createDependencies(
  overrides: Partial<RegistrationSubmissionDependencies> = {},
) {
  const calls = {
    accounts: 0,
    registrations: [] as Array<{ slug: string; userId: string }>,
    definitions: [] as string[],
    submissions: [] as RegistrationSubmissionInput[],
    clock: 0,
  };

  const dependencies: RegistrationSubmissionDependencies = {
    readAccount: async () => {
      calls.accounts += 1;
      return { userId, profileComplete: true };
    },
    readRegistration: async (requestedSlug, requestedUserId) => {
      calls.registrations.push({
        slug: requestedSlug,
        userId: requestedUserId,
      });
      return openRegistration;
    },
    getDefinition: (requestedSlug) => {
      calls.definitions.push(requestedSlug);
      return definition;
    },
    now: () => {
      calls.clock += 1;
      return clock;
    },
    submitRegistration: async (input) => {
      calls.submissions.push(input);
      return { outcome: "saved", status: "confirmed", submittedAt: savedAt };
    },
    ...overrides,
  };

  return { dependencies, calls };
}

test("signed-out callers are asked to sign in without reads or writes", async () => {
  const { dependencies, calls } = createDependencies({
    readAccount: async () => null,
  });

  const result = await runRegistrationSubmission(
    slug,
    form(validFields()),
    dependencies,
  );

  expect(result).toEqual({ kind: "sign_in_required" });
  expect(calls.registrations).toEqual([]);
  expect(calls.definitions).toEqual([]);
  expect(calls.submissions).toEqual([]);
});

test("incomplete profiles never reach validation or the write RPC", async () => {
  const { dependencies, calls } = createDependencies({
    readAccount: async () => ({ userId, profileComplete: false }),
  });

  const result = await runRegistrationSubmission(
    slug,
    form(validFields()),
    dependencies,
  );

  expect(result).toEqual({ kind: "profile_required" });
  expect(calls.definitions).toEqual([]);
  expect(calls.submissions).toEqual([]);
});

test("unknown editions are unavailable without a definition or write", async () => {
  const { dependencies, calls } = createDependencies({
    readRegistration: async () => null,
  });

  const result = await runRegistrationSubmission(
    slug,
    form(validFields()),
    dependencies,
  );

  expect(result).toEqual({ kind: "unavailable" });
  expect(calls.definitions).toEqual([]);
  expect(calls.submissions).toEqual([]);
});

test("missing definitions are unavailable without a write", async () => {
  const { dependencies, calls } = createDependencies({
    getDefinition: () => undefined,
  });

  const result = await runRegistrationSubmission(
    slug,
    form(validFields()),
    dependencies,
  );

  expect(result).toEqual({ kind: "unavailable" });
  expect(calls.submissions).toEqual([]);
});

for (const availability of [
  "not_open",
  "closed",
  "full",
  "not_found",
] as const) {
  for (const status of ["pending", "confirmed", "declined"] as const) {
    test(`stale ${availability} preflight does not hide a saved ${status} receipt from the RPC`, async () => {
      const { dependencies, calls } = createDependencies({
        readRegistration: async () => ({
          eventId,
          receipt: null,
          availability,
        }),
        submitRegistration: async (input) => {
          calls.submissions.push(input);
          return { outcome: "saved", status, submittedAt: savedAt };
        },
      });

      const result = await runRegistrationSubmission(
        slug,
        form(validFields()),
        dependencies,
      );

      expect(result).toEqual({
        kind: "submitted",
        status,
        submittedAt: savedAt,
      });
      expect(calls.submissions).toHaveLength(1);
    });
  }
}

test("stale full availability never bypasses validation or writes invalid answers", async () => {
  const { dependencies, calls } = createDependencies({
    readRegistration: async () => ({
      eventId,
      receipt: null,
      availability: "full",
    }),
  });

  const result = await runRegistrationSubmission(
    slug,
    form(validFields({ "question:name": "   " })),
    dependencies,
  );

  expect(result).toEqual({
    kind: "invalid",
    fieldErrors: { "question:name": "This field is required." },
  });
  expect(calls.submissions).toEqual([]);
});

for (const status of ["pending", "confirmed", "declined"] as const) {
  test(`an existing ${status} receipt wins over closure and a missing definition`, async () => {
    const { dependencies, calls } = createDependencies({
      readRegistration: async (requestedSlug, requestedUserId) => {
        calls.registrations.push({
          slug: requestedSlug,
          userId: requestedUserId,
        });
        return {
          eventId,
          receipt: { status, submittedAt: savedAt },
          availability: "closed",
        };
      },
      getDefinition: () => undefined,
    });

    const result = await runRegistrationSubmission(
      slug,
      form({ "question:name": "" }),
      dependencies,
    );

    expect(result).toEqual({
      kind: "submitted",
      status,
      submittedAt: savedAt,
    });
    expect(calls.registrations).toEqual([{ slug, userId }]);
    expect(calls.definitions).toEqual([]);
    expect(calls.submissions).toEqual([]);
  });
}

test("invalid required answers return field errors without a write", async () => {
  const { dependencies, calls } = createDependencies();

  const result = await runRegistrationSubmission(
    slug,
    form(validFields({ "question:name": "   " })),
    dependencies,
  );

  expect(result).toEqual({
    kind: "invalid",
    fieldErrors: { "question:name": "This field is required." },
  });
  expect(calls.submissions).toEqual([]);
});

test("missing required active conditional detail is invalid without a write", async () => {
  const { dependencies, calls } = createDependencies();

  const result = await runRegistrationSubmission(
    slug,
    form(validFields({ "question:topics": ["other"] })),
    dependencies,
  );

  expect(result).toEqual({
    kind: "invalid",
    fieldErrors: { "question:details": "This field is required." },
  });
  expect(calls.submissions).toEqual([]);
});

test("an exclusive multiselect combination is invalid without a write", async () => {
  const { dependencies, calls } = createDependencies();

  const result = await runRegistrationSubmission(
    slug,
    form(validFields({ "question:topics": ["none", "ai"] })),
    dependencies,
  );

  expect(result).toEqual({
    kind: "invalid",
    fieldErrors: {
      "question:topics": "Do not combine this option with other choices.",
    },
  });
  expect(calls.submissions).toEqual([]);
});

test("valid answers forward arrays, verified identity, trusted agreements, and one server clock", async () => {
  const { dependencies, calls } = createDependencies({
    submitRegistration: async (input) => {
      calls.submissions.push(input);
      return { outcome: "saved", status: "confirmed", submittedAt: savedAt };
    },
  });

  const result = await runRegistrationSubmission(
    slug,
    form(
      validFields({
        user_id: "99999999-9999-4999-8999-999999999999",
        status: "confirmed",
        submitted_at: "2000-01-01T00:00:00.000Z",
        "question:name": "  Ada  ",
        "question:topics": ["ai", "web"],
      }),
    ),
    dependencies,
  );

  expect(result).toEqual({
    kind: "submitted",
    status: "confirmed",
    submittedAt: savedAt,
  });
  expect(calls.registrations).toEqual([{ slug, userId }]);
  expect(calls.clock).toBe(1);
  expect(calls.submissions).toEqual([
    {
      eventId,
      userId,
      answers: { name: "Ada", topics: ["ai", "web"] },
      acceptedAgreements: [
        {
          key: "terms",
          text: "Trusted terms",
          accepted_at: clockIso,
        },
      ],
    },
  ]);
});

test("stale inactive conditional answers are omitted from the forwarded answers", async () => {
  const { dependencies, calls } = createDependencies();

  const result = await runRegistrationSubmission(
    slug,
    form(
      validFields({
        "question:topics": ["ai"],
        "question:details": "stale answer",
      }),
    ),
    dependencies,
  );

  expect(result.kind).toBe("submitted");
  expect(calls.submissions).toHaveLength(1);
  expect(calls.submissions[0].answers).toEqual({
    name: "Ada",
    topics: ["ai"],
  });
});

for (const status of ["pending", "confirmed", "declined"] as const) {
  test(`a saved RPC outcome maps to submitted with the returned ${status} status`, async () => {
    const { dependencies } = createDependencies({
      submitRegistration: async () => ({
        outcome: "saved",
        status,
        submittedAt: savedAt,
      }),
    });

    const result = await runRegistrationSubmission(
      slug,
      form(validFields()),
      dependencies,
    );

    expect(result).toEqual({
      kind: "submitted",
      status,
      submittedAt: savedAt,
    });
  });
}

for (const [outcome, kind] of [
  ["not_open", "not_open"],
  ["closed", "closed"],
  ["full", "full"],
  ["not_found", "unavailable"],
  ["profile_required", "profile_required"],
] as const) {
  test(`a ${outcome} RPC outcome maps to ${kind}`, async () => {
    const { dependencies } = createDependencies({
      submitRegistration: async () => ({
        outcome,
        status: null,
        submittedAt: null,
      }),
    });

    const result = await runRegistrationSubmission(
      slug,
      form(validFields()),
      dependencies,
    );

    expect(result).toEqual({ kind });
  });
}

test("saved outcomes without a valid status or timestamp retry", async () => {
  const missingStatus = createDependencies({
    submitRegistration: async () => ({
      outcome: "saved",
      status: null,
      submittedAt: savedAt,
    }),
  });
  const missingTimestamp = createDependencies({
    submitRegistration: async () => ({
      outcome: "saved",
      status: "confirmed",
      submittedAt: null,
    }),
  });

  await expect(
    runRegistrationSubmission(
      slug,
      form(validFields()),
      missingStatus.dependencies,
    ),
  ).resolves.toEqual({ kind: "retry" });
  await expect(
    runRegistrationSubmission(
      slug,
      form(validFields()),
      missingTimestamp.dependencies,
    ),
  ).resolves.toEqual({ kind: "retry" });
});

test("unknown RPC outcomes retry", async () => {
  const { dependencies } = createDependencies({
    submitRegistration: async () => ({
      outcome: "unexpected",
      status: null,
      submittedAt: null,
    }),
  });

  await expect(
    runRegistrationSubmission(slug, form(validFields()), dependencies),
  ).resolves.toEqual({ kind: "retry" });
});

test("RPC failures return a generic retry without database text", async () => {
  const { dependencies } = createDependencies({
    submitRegistration: async () => {
      throw new Error('duplicate key value violates "event_registrations_pkey"');
    },
  });

  const result = await runRegistrationSubmission(
    slug,
    form(validFields()),
    dependencies,
  );

  expect(result).toEqual({ kind: "retry" });
  expect(JSON.stringify(result)).not.toContain("duplicate key");
});

for (const [name, override] of [
  [
    "account",
    async (): Promise<{ userId: string; profileComplete: boolean } | null> => {
      throw new Error("account read failed");
    },
  ],
  [
    "registration",
    async (): Promise<EventRegistrationRead | null> => {
      throw new Error("registration read failed");
    },
  ],
] as const) {
  test(`${name} read failures return a generic retry`, async () => {
    const { dependencies } = createDependencies(
      name === "account"
        ? { readAccount: override }
        : { readRegistration: override },
    );

    const result: RegistrationResult = await runRegistrationSubmission(
      slug,
      form(validFields()),
      dependencies,
    );

    expect(result).toEqual({ kind: "retry" });
  });
}
