import { expect, test } from "@playwright/test";
import { getEventForm } from "../../../data/event-forms";
import type { EventForm } from "../../../lib/events/form-definition";
import { validateRegistration } from "../../../lib/events/validate-registration";

const acceptedAt = "2026-11-04T12:00:00.000Z";

const validationForm: EventForm = {
  title: "Test form",
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
  ],
  agreements: [
    {
      id: "terms",
      label: "Terms",
      text: "Trusted agreement text",
      required: true,
    },
    {
      id: "updates",
      label: "Updates",
      text: "Trusted optional agreement text",
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

test("accepts trimmed answers, a required false value, and a trusted agreement snapshot", () => {
  const result = validateRegistration(
    validationForm,
    formValues({
      "question:name": "  Ada  ",
      "question:has_team": "false",
      "question:track": "build",
      "agreement:terms": "yes",
      next: "/events/casehack-2026/register",
    }),
    acceptedAt,
  );

  expect(result).toEqual({
    ok: true,
    answers: { name: "Ada", has_team: false, track: "build" },
    acceptedAgreements: [
      {
        key: "terms",
        text: "Trusted agreement text",
        accepted_at: acceptedAt,
      },
    ],
  });
});

test("accepts exact text limits and records a checked optional agreement", () => {
  const name = "😀".repeat(10);
  const bio = "😀".repeat(20);

  const result = validateRegistration(
    validationForm,
    formValues({
      "question:name": name,
      "question:bio": bio,
      "question:has_team": "true",
      "question:track": "design",
      "question:role": "member",
      "agreement:terms": "yes",
      "agreement:updates": "yes",
    }),
    acceptedAt,
  );

  expect(result).toEqual({
    ok: true,
    answers: { name, bio, has_team: true, track: "design", role: "member" },
    acceptedAgreements: [
      {
        key: "terms",
        text: "Trusted agreement text",
        accepted_at: acceptedAt,
      },
      {
        key: "updates",
        text: "Trusted optional agreement text",
        accepted_at: acceptedAt,
      },
    ],
  });
});

test("rejects blank required answers and omits blank optional answers", () => {
  const result = validateRegistration(
    validationForm,
    formValues({
      "question:name": "   ",
      "question:bio": "   ",
      "question:track": "",
      "question:role": "",
    }),
    acceptedAt,
  );

  expect(result).toEqual({
    ok: false,
    fieldErrors: {
      "question:name": "This field is required.",
      "question:has_team": "This field is required.",
      "question:track": "This field is required.",
      "agreement:terms": "Check this agreement to continue.",
    },
  });
});

test("rejects oversized text using Unicode code points", () => {
  const result = validateRegistration(
    validationForm,
    formValues({
      "question:name": "😀".repeat(11),
      "question:bio": "😀".repeat(21),
      "question:has_team": "true",
      "question:track": "build",
      "agreement:terms": "yes",
    }),
    acceptedAt,
  );

  expect(result).toEqual({
    ok: false,
    fieldErrors: {
      "question:name": "Use 10 characters or fewer.",
      "question:bio": "Use 20 characters or fewer.",
    },
  });
});

test("rejects duplicate question and agreement fields", () => {
  const result = validateRegistration(
    validationForm,
    formValues({
      "question:name": ["Ada", "Grace"],
      "question:has_team": ["true", "false"],
      "question:track": "build",
      "agreement:terms": ["yes", "yes"],
    }),
    acceptedAt,
  );

  expect(result).toEqual({
    ok: false,
    fieldErrors: {
      "question:name": "Submit this field only once.",
      "question:has_team": "Submit this field only once.",
      "agreement:terms": "Submit this agreement only once.",
    },
  });
});

test("rejects files submitted as answers or agreements", () => {
  const result = validateRegistration(
    validationForm,
    formValues({
      "question:name": new File(["Ada"], "ada.txt"),
      "question:has_team": "true",
      "question:track": "build",
      "agreement:terms": new File(["yes"], "yes.txt"),
    }),
    acceptedAt,
  );

  expect(result).toEqual({
    ok: false,
    fieldErrors: {
      "question:name": "Submit a text value for this field.",
      "agreement:terms": "Check this agreement to continue.",
    },
  });
});

test("rejects values outside a select's choices and invalid yes/no answers", () => {
  const result = validateRegistration(
    validationForm,
    formValues({
      "question:name": "Ada",
      "question:has_team": "yes",
      "question:track": "unknown",
      "agreement:terms": "true",
    }),
    acceptedAt,
  );

  expect(result).toEqual({
    ok: false,
    fieldErrors: {
      "question:has_team": "Choose yes or no.",
      "question:track": "Choose one of the available options.",
      "agreement:terms": "Check this agreement to continue.",
    },
  });
});

test("rejects unknown form fields and ignores framework fields", () => {
  const result = validateRegistration(
    validationForm,
    formValues({
      "question:name": "Ada",
      "question:has_team": "true",
      "question:track": "build",
      "agreement:terms": "yes",
      "question:constructor": ["x", "y"],
      "question:__proto__": "x",
      "agreement:prototype": "yes",
      next: "/events",
      csrf_token: "token",
    }),
    acceptedAt,
  );

  expect(result).toEqual({
    ok: false,
    fieldErrors: {
      "question:constructor": "Unknown field.",
      "question:__proto__": "Unknown field.",
      "agreement:prototype": "Unknown field.",
    },
  });
});

const selectionForm: EventForm = {
  title: "Selection form",
  questions: [
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
    {
      id: "notes",
      kind: "multiselect",
      label: "Notes",
      required: false,
      choices: [
        { value: "one", label: "One" },
        { value: "two", label: "Two" },
      ],
    },
  ],
  agreements: [],
};

test("accepts repeated distinct multiselect values and omits optional selections", () => {
  const result = validateRegistration(
    selectionForm,
    formValues({
      "question:topics": ["ai", "web"],
      "question:notes": ["one", "two"],
    }),
    acceptedAt,
  );

  expect(result).toEqual({
    ok: true,
    answers: { topics: ["ai", "web"], notes: ["one", "two"] },
    acceptedAgreements: [],
  });
});

test("accepts an exclusive multiselect choice on its own", () => {
  const result = validateRegistration(
    selectionForm,
    formValues({ "question:topics": ["none"] }),
    acceptedAt,
  );

  expect(result).toEqual({
    ok: true,
    answers: { topics: ["none"] },
    acceptedAgreements: [],
  });
});

test("rejects duplicate or unknown multiselect selections", () => {
  const result = validateRegistration(
    selectionForm,
    formValues({
      "question:topics": ["ai", "ai"],
      "question:notes": ["one", "unknown"],
    }),
    acceptedAt,
  );

  expect(result).toEqual({
    ok: false,
    fieldErrors: {
      "question:topics": "Submit each option only once.",
      "question:notes": "Choose one of the available options.",
    },
  });
});

test("rejects combining an exclusive choice with other choices", () => {
  const result = validateRegistration(
    selectionForm,
    formValues({ "question:topics": ["none", "ai"] }),
    acceptedAt,
  );

  expect(result).toEqual({
    ok: false,
    fieldErrors: {
      "question:topics": "Do not combine this option with other choices.",
    },
  });
});

test("requires a multiselect answer when the question is required", () => {
  const result = validateRegistration(selectionForm, formValues({}), acceptedAt);

  expect(result).toEqual({
    ok: false,
    fieldErrors: { "question:topics": "This field is required." },
  });
});

const conditionalForm: EventForm = {
  title: "Conditional form",
  questions: [
    {
      id: "details",
      kind: "text",
      label: "Details",
      required: false,
      maxLength: 20,
      requiredWhen: {
        questionId: "source",
        includesAny: ["other"],
      },
    },
    {
      id: "topic_details",
      kind: "textarea",
      label: "Topic details",
      required: false,
      maxLength: 20,
      requiredWhen: {
        questionId: "topics",
        includesAny: ["other"],
      },
    },
    {
      id: "source",
      kind: "select",
      label: "Source",
      required: true,
      choices: [
        { value: "friend", label: "Friend" },
        { value: "other", label: "Other" },
      ],
    },
    {
      id: "topics",
      kind: "multiselect",
      label: "Topics",
      required: true,
      choices: [
        { value: "ai", label: "AI" },
        { value: "other", label: "Other" },
      ],
    },
  ],
  agreements: [],
};

test("requires conditionally active text and omits inactive answers", () => {
  const active = validateRegistration(
    conditionalForm,
    formValues({
      "question:source": "other",
      "question:topics": ["ai"],
      "question:details": "   ",
    }),
    acceptedAt,
  );

  expect(active).toEqual({
    ok: false,
    fieldErrors: { "question:details": "This field is required." },
  });

  const inactive = validateRegistration(
    conditionalForm,
    formValues({
      "question:source": "friend",
      "question:topics": ["ai"],
      "question:details": "stale answer",
      "question:topic_details": "stale answer",
    }),
    acceptedAt,
  );

  expect(inactive).toEqual({
    ok: true,
    answers: { source: "friend", topics: ["ai"] },
    acceptedAgreements: [],
  });
});

test("activates conditions from multiselect answers", () => {
  const result = validateRegistration(
    conditionalForm,
    formValues({
      "question:source": "friend",
      "question:topics": ["ai", "other"],
      "question:topic_details": "Specific topic",
    }),
    acceptedAt,
  );

  expect(result).toEqual({
    ok: true,
    answers: {
      source: "friend",
      topics: ["ai", "other"],
      topic_details: "Specific topic",
    },
    acceptedAgreements: [],
  });
});

test("evaluates conditions only from validated controlling answers", () => {
  const invalidSelect = validateRegistration(
    conditionalForm,
    formValues({
      "question:source": "unknown",
      "question:topics": ["ai"],
      "question:details": "stale answer",
    }),
    acceptedAt,
  );

  expect(invalidSelect).toEqual({
    ok: false,
    fieldErrors: {
      "question:source": "Choose one of the available options.",
    },
  });

  const invalidMultiselect = validateRegistration(
    conditionalForm,
    formValues({
      "question:source": "friend",
      "question:topics": ["none"],
      "question:topic_details": "stale answer",
    }),
    acceptedAt,
  );

  expect(invalidMultiselect).toEqual({
    ok: false,
    fieldErrors: {
      "question:topics": "Choose one of the available options.",
    },
  });
});

test("validates a complete CaseHack application against the agreed contract", () => {
  const form = getEventForm("casehack-2026");
  if (!form) throw new Error("CaseHack form is missing.");

  const result = validateRegistration(
    form,
    formValues({
      "question:program": "Computer Science",
      "question:year_of_study": "3",
      "question:previous_hackathons": "2_3",
      "question:dietary_restrictions": ["vegetarian", "food_allergy"],
      "question:dietary_details": "Peanuts",
      "question:referral_source": "other",
      "question:referral_other": "A friend's poster",
      "agreement:application_status": "yes",
      "agreement:participant_conduct": "yes",
      "agreement:application_data": "yes",
      "agreement:photo_video_consent": "yes",
    }),
    acceptedAt,
  );

  expect(result).toEqual({
    ok: true,
    answers: {
      program: "Computer Science",
      year_of_study: "3",
      previous_hackathons: "2_3",
      dietary_restrictions: ["vegetarian", "food_allergy"],
      dietary_details: "Peanuts",
      referral_source: "other",
      referral_other: "A friend's poster",
    },
    acceptedAgreements: [
      {
        key: "application_status",
        text: "I understand that submitting this application does not confirm my place at CaseHack. UBC Startups will contact me about my application outcome.",
        accepted_at: acceptedAt,
      },
      {
        key: "participant_conduct",
        text: "I agree to treat participants, organizers, mentors, and judges respectfully, avoid harassment and discrimination, and follow reasonable instructions from event organizers.",
        accepted_at: acceptedAt,
      },
      {
        key: "application_data",
        text: "I understand that UBC Startups will use the information I submit to review my application, organize CaseHack, plan food, and contact me about the event.",
        accepted_at: acceptedAt,
      },
      {
        key: "photo_video_consent",
        text: "I consent to photographs and videos of me being taken during CaseHack and used by UBC Startups to promote CaseHack through its website and social media channels.",
        accepted_at: acceptedAt,
      },
    ],
  });
});

test("omits stale CaseHack dependent answers for inactive conditions", () => {
  const form = getEventForm("casehack-2026");
  if (!form) throw new Error("CaseHack form is missing.");

  const result = validateRegistration(
    form,
    formValues({
      "question:program": "Computer Science",
      "question:year_of_study": "1",
      "question:previous_hackathons": "0",
      "question:dietary_restrictions": ["none"],
      "question:dietary_details": "stale answer",
      "question:referral_source": "friend",
      "question:referral_other": "stale answer",
      "agreement:application_status": "yes",
      "agreement:participant_conduct": "yes",
      "agreement:application_data": "yes",
      "agreement:photo_video_consent": "yes",
    }),
    acceptedAt,
  );

  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.answers).toEqual({
    program: "Computer Science",
    year_of_study: "1",
    previous_hackathons: "0",
    dietary_restrictions: ["none"],
    referral_source: "friend",
  });
});
