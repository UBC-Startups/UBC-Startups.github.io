import { expect, test } from "@playwright/test";
import type { EventForm } from "../../../lib/events/form-definition";
import {
  REGISTRATION_DRAFT_MAX_BYTES,
  validateRegistrationDraft,
} from "../../../lib/events/validate-registration";

const draftForm: EventForm = {
  title: "Draft form",
  questions: [
    {
      id: "name",
      kind: "text",
      label: "Name",
      required: true,
      maxLength: 10,
    },
    {
      id: "bio",
      kind: "textarea",
      label: "Bio",
      required: false,
      maxLength: 20,
    },
    {
      id: "motivation",
      kind: "textarea",
      label: "Motivation",
      required: true,
      maxWords: 3,
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
      id: "role",
      kind: "select",
      label: "Role",
      required: false,
      choices: [
        { value: "lead", label: "Lead" },
        { value: "member", label: "Member" },
      ],
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
    {
      id: "updates",
      label: "Updates",
      text: "Trusted optional updates",
      required: false,
    },
  ],
};

function formValues(fields: Record<string, string | string[] | File>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    for (const entry of Array.isArray(value) ? value : [value]) {
      data.append(key, entry);
    }
  }
  return data;
}

test("accepts a missing or incomplete draft without requiring any answer", () => {
  expect(validateRegistrationDraft(draftForm, formValues({}))).toEqual({
    ok: true,
    answers: {},
    agreementKeys: [],
  });

  expect(
    validateRegistrationDraft(
      draftForm,
      formValues({
        "question:name": "",
        "question:bio": "   ",
        "question:motivation": "",
        "question:track": "",
      }),
    ),
  ).toEqual({
    ok: true,
    answers: {
      name: "",
      bio: "   ",
      motivation: "",
      track: "",
    },
    agreementKeys: [],
  });
});

test("preserves exact raw whitespace and bypasses final text and word limits", () => {
  const name = "  Ada Lovelace  ";
  const bio = "\t\n  A bio beyond the final limit  \n";
  const motivation = "one two three four five six seven";

  const result = validateRegistrationDraft(
    draftForm,
    formValues({
      "question:name": name,
      "question:bio": bio,
      "question:motivation": motivation,
    }),
  );

  expect(result).toEqual({
    ok: true,
    answers: { name, bio, motivation },
    agreementKeys: [],
  });
});

test("stores raw boolean strings, allows an unselected select, and keeps known choices", () => {
  const result = validateRegistrationDraft(
    draftForm,
    formValues({
      "question:has_team": "false",
      "question:track": "build",
      "question:role": "",
      "question:topics": ["ai", "web"],
      "agreement:terms": "yes",
      "agreement:updates": "yes",
    }),
  );

  expect(result).toEqual({
    ok: true,
    answers: {
      has_team: "false",
      track: "build",
      role: "",
      topics: ["ai", "web"],
    },
    agreementKeys: ["terms", "updates"],
  });
  if (!result.ok) return;
  expect("acceptedAgreements" in result).toBe(false);
});

test("clearing an answer omits it from the replacement snapshot", () => {
  const first = validateRegistrationDraft(
    draftForm,
    formValues({
      "question:name": "Ada",
      "agreement:terms": "yes",
    }),
  );
  const cleared = validateRegistrationDraft(draftForm, formValues({}));

  expect(first).toEqual({
    ok: true,
    answers: { name: "Ada" },
    agreementKeys: ["terms"],
  });
  expect(cleared).toEqual({ ok: true, answers: {}, agreementKeys: [] });
});

test("records only checked definition agreement ids", () => {
  const result = validateRegistrationDraft(
    draftForm,
    formValues({ "agreement:updates": "yes" }),
  );

  expect(result).toEqual({
    ok: true,
    answers: {},
    agreementKeys: ["updates"],
  });
});

test("rejects duplicate scalar, selection, and agreement fields", () => {
  const result = validateRegistrationDraft(
    draftForm,
    formValues({
      "question:name": ["Ada", "Grace"],
      "question:has_team": ["true", "false"],
      "question:topics": ["ai", "ai"],
      "agreement:terms": ["yes", "yes"],
    }),
  );

  expect(result).toEqual({
    ok: false,
    fieldErrors: {
      "question:name": "Submit this field only once.",
      "question:has_team": "Submit this field only once.",
      "question:topics": "Submit each option only once.",
      "agreement:terms": "Submit this agreement only once.",
    },
  });
});

test("rejects unknown prefixed fields but ignores unrelated framework fields", () => {
  const result = validateRegistrationDraft(
    draftForm,
    formValues({
      "question:__proto__": "x",
      "question:missing": "x",
      "agreement:missing": "yes",
      draft_revision: "4",
      next: "/events",
    }),
  );

  expect(result).toEqual({
    ok: false,
    fieldErrors: {
      "question:__proto__": "Unknown field.",
      "question:missing": "Unknown field.",
      "agreement:missing": "Unknown field.",
    },
  });
});

test("rejects files and invalid boolean, select, exclusive, and agreement values", () => {
  const result = validateRegistrationDraft(
    draftForm,
    formValues({
      "question:name": new File(["Ada"], "ada.txt"),
      "question:has_team": "yes",
      "question:track": "unknown",
      "question:topics": ["none", "ai"],
      "agreement:terms": "true",
    }),
  );

  expect(result).toEqual({
    ok: false,
    fieldErrors: {
      "question:name": "Submit a text value for this field.",
      "question:has_team": "Choose yes or no.",
      "question:track": "Choose one of the available options.",
      "question:topics": "Do not combine this option with other choices.",
      "agreement:terms": "Check this agreement to continue.",
    },
  });
});

test("bounds the combined UTF-8 JSON payload at 64 KiB", () => {
  const result = validateRegistrationDraft(
    draftForm,
    formValues({ "question:bio": "x".repeat(REGISTRATION_DRAFT_MAX_BYTES) }),
  );

  expect(result.ok).toBe(false);
  if (result.ok) return;
  expect(result.fieldErrors.draft).toBeDefined();
});
