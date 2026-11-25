import { expect, test } from "@playwright/test";
import type { EventForm } from "../../../lib/events/form-definition";
import type { EventRegistrationRead } from "../../../lib/events/registration-result";
import {
  runRegistrationDraftSave,
  type RegistrationDraftSaveDependencies,
  type RegistrationDraftSaveInput,
} from "../../../lib/events/save-registration-draft";

const slug = "casehack-2026";
const userId = "11111111-1111-4111-8111-111111111111";
const eventId = "22222222-2222-4222-8222-222222222222";
const savedAt = "2026-11-01T12:00:00.000Z";

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
      id: "has_team",
      kind: "boolean",
      label: "Has a team",
      required: true,
    },
    {
      id: "track",
      kind: "select",
      label: "Track",
      required: true,
      choices: [
        { value: "build", label: "Build" },
        { value: "design", label: "Design" },
      ],
    },
    {
      id: "topics",
      kind: "multiselect",
      label: "Topics",
      required: true,
      choices: [
        { value: "ai", label: "AI" },
        { value: "web", label: "Web" },
      ],
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
  draft: null,
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

function validFields(): Record<string, string | string[]> {
  return {
    "question:name": "  Ada  ",
    "question:has_team": "false",
    "question:track": "build",
    "question:topics": ["ai", "web"],
    "agreement:terms": "yes",
  };
}

function createDependencies(
  overrides: Partial<RegistrationDraftSaveDependencies> = {},
) {
  const calls = {
    accounts: 0,
    registrations: [] as Array<{ slug: string; userId: string }>,
    definitions: [] as string[],
    saves: [] as RegistrationDraftSaveInput[],
  };

  const dependencies: RegistrationDraftSaveDependencies = {
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
    saveRegistrationDraft: async (input) => {
      calls.saves.push(input);
      return {
        outcome: "saved",
        revision: 3,
        savedAt,
        status: "draft",
        submittedAt: null,
      };
    },
    ...overrides,
  };

  return { dependencies, calls };
}

test("rejects an invalid expected revision before any account or write work", async () => {
  for (const revision of [
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER + 1,
  ]) {
    const { dependencies, calls } = createDependencies();

    const result = await runRegistrationDraftSave(
      slug,
      revision,
      form(validFields()),
      dependencies,
    );

    expect(result).toEqual({
      kind: "invalid",
      fieldErrors: {
        draft_revision: "Reload the page and try saving again.",
      },
    });
    expect(calls.accounts).toBe(0);
    expect(calls.registrations).toEqual([]);
    expect(calls.saves).toEqual([]);
  }
});

test("signed-out callers are asked to sign in without reads or writes", async () => {
  const { dependencies, calls } = createDependencies({
    readAccount: async () => null,
  });

  const result = await runRegistrationDraftSave(
    slug,
    0,
    form(validFields()),
    dependencies,
  );

  expect(result).toEqual({ kind: "sign_in_required" });
  expect(calls.registrations).toEqual([]);
  expect(calls.definitions).toEqual([]);
  expect(calls.saves).toEqual([]);
});

test("incomplete profiles never reach validation or the save RPC", async () => {
  const { dependencies, calls } = createDependencies({
    readAccount: async () => ({ userId, profileComplete: false }),
  });

  const result = await runRegistrationDraftSave(
    slug,
    0,
    form(validFields()),
    dependencies,
  );

  expect(result).toEqual({ kind: "profile_required" });
  expect(calls.definitions).toEqual([]);
  expect(calls.saves).toEqual([]);
});

test("unknown editions are unavailable without a definition or write", async () => {
  const { dependencies, calls } = createDependencies({
    readRegistration: async () => null,
  });

  const result = await runRegistrationDraftSave(
    slug,
    0,
    form(validFields()),
    dependencies,
  );

  expect(result).toEqual({ kind: "unavailable" });
  expect(calls.definitions).toEqual([]);
  expect(calls.saves).toEqual([]);
});

test("missing definitions are unavailable without a write", async () => {
  const { dependencies, calls } = createDependencies({
    getDefinition: () => undefined,
  });

  const result = await runRegistrationDraftSave(
    slug,
    0,
    form(validFields()),
    dependencies,
  );

  expect(result).toEqual({ kind: "unavailable" });
  expect(calls.saves).toEqual([]);
});

for (const status of ["pending", "confirmed", "declined"] as const) {
  test(`a late autosave returns the existing ${status} receipt`, async () => {
    const { dependencies, calls } = createDependencies({
      readRegistration: async () => ({
        eventId,
        receipt: { status, submittedAt: savedAt },
        draft: { answers: {}, agreementKeys: [], revision: 2, updatedAt: savedAt },
        availability: "closed",
      }),
      getDefinition: () => undefined,
    });

    const result = await runRegistrationDraftSave(
      slug,
      2,
      form({ "question:name": "" }),
      dependencies,
    );

    expect(result).toEqual({
      kind: "submitted",
      status,
      submittedAt: savedAt,
    });
    expect(calls.definitions).toEqual([]);
    expect(calls.saves).toEqual([]);
  });
}

test("availability is not preflighted because the database decides", async () => {
  const { dependencies, calls } = createDependencies({
    readRegistration: async () => ({
      ...openRegistration,
      availability: "closed",
    }),
  });

  const result = await runRegistrationDraftSave(
    slug,
    2,
    form(validFields()),
    dependencies,
  );

  expect(result).toEqual({ kind: "saved", revision: 3, savedAt });
  expect(calls.saves).toHaveLength(1);
});

test("forwards the trusted identity, own event, raw answers, checked keys, and revision", async () => {
  const { dependencies, calls } = createDependencies();

  const result = await runRegistrationDraftSave(
    slug,
    2,
    form({
      ...validFields(),
      "question:name": "  Ada  ",
      user_id: "99999999-9999-4999-8999-999999999999",
      status: "confirmed",
      submitted_at: "2000-01-01T00:00:00.000Z",
    }),
    dependencies,
  );

  expect(result).toEqual({ kind: "saved", revision: 3, savedAt });
  expect(calls.registrations).toEqual([{ slug, userId }]);
  expect(calls.saves).toEqual([
    {
      eventId,
      userId,
      answers: {
        name: "  Ada  ",
        has_team: "false",
        track: "build",
        topics: ["ai", "web"],
      },
      agreementKeys: ["terms"],
      expectedRevision: 2,
    },
  ]);
  expect(Object.keys(calls.saves[0])).not.toContain("acceptedAgreements");
});

test("invalid draft payloads return field errors without a write", async () => {
  const { dependencies, calls } = createDependencies();

  const result = await runRegistrationDraftSave(
    slug,
    0,
    form({
      ...validFields(),
      "question:unknown": "x",
      "question:has_team": "yes",
    }),
    dependencies,
  );

  expect(result).toEqual({
    kind: "invalid",
    fieldErrors: {
      "question:unknown": "Unknown field.",
      "question:has_team": "Choose yes or no.",
    },
  });
  expect(calls.saves).toEqual([]);
});

for (const [outcome, expected] of [
  ["conflict", { kind: "conflict" }],
  ["not_found", { kind: "unavailable" }],
  ["profile_required", { kind: "profile_required" }],
  ["not_open", { kind: "not_open" }],
  ["closed", { kind: "closed" }],
] as const) {
  test(`a ${outcome} RPC outcome maps to ${expected.kind}`, async () => {
    const { dependencies } = createDependencies({
      saveRegistrationDraft: async () => ({
        outcome,
        revision: null,
        savedAt: null,
        status: null,
        submittedAt: null,
      }),
    });

    const result = await runRegistrationDraftSave(
      slug,
      0,
      form(validFields()),
      dependencies,
    );

    expect(result).toEqual(expected);
  });
}

test("an invalid_payload RPC outcome is a field error", async () => {
  const { dependencies } = createDependencies({
    saveRegistrationDraft: async () => ({
      outcome: "invalid_payload",
      revision: null,
      savedAt: null,
      status: null,
      submittedAt: null,
    }),
  });

  const result = await runRegistrationDraftSave(
    slug,
    0,
    form(validFields()),
    dependencies,
  );

  expect(result.kind).toBe("invalid");
  if (result.kind !== "invalid") return;
  expect(result.fieldErrors.draft).toBeDefined();
});

for (const status of ["pending", "confirmed", "declined"] as const) {
  test(`a submitted RPC outcome returns the ${status} receipt`, async () => {
    const { dependencies } = createDependencies({
      saveRegistrationDraft: async () => ({
        outcome: "submitted",
        revision: 4,
        savedAt,
        status,
        submittedAt: savedAt,
      }),
    });

    const result = await runRegistrationDraftSave(
      slug,
      0,
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

test("malformed, mismatched, or unknown RPC outcomes retry", async () => {
  for (const outcome of [
    { outcome: "saved", revision: null, savedAt, status: "draft", submittedAt: null },
    { outcome: "saved", revision: 0, savedAt, status: "draft", submittedAt: null },
    { outcome: "saved", revision: 1.5, savedAt, status: "draft", submittedAt: null },
    { outcome: "saved", revision: 2, savedAt: null, status: "draft", submittedAt: null },
    { outcome: "saved", revision: 2, savedAt: "", status: "draft", submittedAt: null },
    { outcome: "submitted", revision: 2, savedAt, status: "draft", submittedAt: savedAt },
    { outcome: "submitted", revision: 2, savedAt, status: null, submittedAt: savedAt },
    { outcome: "submitted", revision: 2, savedAt, status: "confirmed", submittedAt: null },
    { outcome: "submitted", revision: 2, savedAt, status: "confirmed", submittedAt: "" },
    { outcome: "unexpected", revision: null, savedAt: null, status: null, submittedAt: null },
  ] as const) {
    const { dependencies } = createDependencies({
      saveRegistrationDraft: async () => ({ ...outcome }),
    });

    await expect(
      runRegistrationDraftSave(slug, 0, form(validFields()), dependencies),
    ).resolves.toEqual({ kind: "retry" });
  }
});

test("RPC failures return a generic retry without database text", async () => {
  const { dependencies } = createDependencies({
    saveRegistrationDraft: async () => {
      throw new Error('duplicate key value violates "event_registrations_pkey"');
    },
  });

  const result = await runRegistrationDraftSave(
    slug,
    0,
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
  [
    "definition",
    (): EventForm | undefined => {
      throw new Error("definition read failed");
    },
  ],
] as const) {
  test(`${name} read failures return a generic retry`, async () => {
    const { dependencies } = createDependencies(
      name === "account"
        ? { readAccount: override }
        : name === "registration"
          ? { readRegistration: override }
          : { getDefinition: override },
    );

    const result = await runRegistrationDraftSave(
      slug,
      0,
      form(validFields()),
      dependencies,
    );

    expect(result).toEqual({ kind: "retry" });
  });
}
