import { expect, test } from "@playwright/test";
import type { EventForm } from "../../../lib/events/form-definition";
import {
  DRAFT_VALIDATION_ACCEPTED_AT,
  draftSnapshotToFormData,
  restoreAgreements,
  restoreAnswers,
  snapshotFromFormData,
  snapshotFromState,
} from "../../../views/registration/registration-draft";

const definition: EventForm = {
  title: "Synthetic form",
  questions: [
    {
      id: "name",
      kind: "text",
      label: "Name",
      required: true,
      maxLength: 120,
    },
    {
      id: "track",
      kind: "select",
      label: "Track",
      required: true,
      choices: [
        { value: "alpha", label: "Alpha" },
        { value: "beta", label: "Beta" },
      ],
    },
    {
      id: "topics",
      kind: "multiselect",
      label: "Topics",
      required: false,
      choices: [
        { value: "one", label: "One" },
        { value: "two", label: "Two" },
        { value: "other", label: "Other" },
      ],
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
      id: "details",
      kind: "text",
      label: "Details",
      required: false,
      maxLength: 50,
      requiredWhen: {
        questionId: "source",
        includesAny: ["other"],
      },
    },
    {
      id: "topic_notes",
      kind: "textarea",
      label: "Topic notes",
      required: false,
      maxLength: 100,
      requiredWhen: {
        questionId: "topics",
        includesAny: ["other"],
      },
    },
    {
      id: "essay",
      kind: "textarea",
      label: "Essay",
      required: false,
      maxWords: 150,
    },
  ],
  agreements: [
    {
      id: "terms",
      label: "Terms",
      text: "Terms text",
      required: true,
    },
    {
      id: "updates",
      label: "Updates",
      text: "Updates text",
      required: false,
    },
    {
      id: "conduct",
      label: "Conduct",
      text: "Conduct text",
      required: true,
    },
  ],
};

function words(count: number): string {
  return Array.from({ length: count }, (_, index) => `word${index}`).join(" ");
}

test("restores known draft answers and preserves raw whitespace and long text", () => {
  const essay = `  ${words(151)}  `;
  const answers = restoreAnswers(definition, {
    answers: {
      name: "  Ada Lovelace\n",
      track: "alpha",
      topics: ["one", "unknown", "one"],
      source: "other",
      details: "\tSome detail  ",
      topic_notes: "Should not be included",
      essay,
      retired_question: "ignore me",
    },
  });

  expect(answers.name).toBe("  Ada Lovelace\n");
  expect(answers.track).toBe("alpha");
  expect(answers.topics).toEqual(["one"]);
  expect(answers.source).toBe("other");
  expect(answers.details).toBe("\tSome detail  ");
  expect(answers.essay).toBe(essay);
  expect(answers).not.toHaveProperty("topic_notes");
  expect(answers).not.toHaveProperty("retired_question");
});

test("drops restored conditional answers whose controlling answer is inactive", () => {
  const answers = restoreAnswers(definition, {
    answers: {
      name: "Ada",
      track: "alpha",
      topics: ["one"],
      source: "friend",
      details: "Stale details",
      topic_notes: "Stale topic notes",
    },
  });

  expect(answers).not.toHaveProperty("details");
  expect(answers).not.toHaveProperty("topic_notes");
});

test("restores only agreement ids that still exist in the definition", () => {
  const agreements = restoreAgreements(definition, {
    agreementKeys: ["terms", "removed_agreement", "terms"],
  });

  expect(agreements.terms).toBe(true);
  expect(agreements.updates).toBe(false);
  expect(agreements.conduct).toBe(false);
  expect(agreements).not.toHaveProperty("removed_agreement");
});

test("state snapshots omit cleared fields and inactive conditional answers", () => {
  const answers = restoreAnswers(definition, {
    answers: {
      name: "Ada",
      track: "alpha",
      topics: ["one"],
      source: "friend",
      details: "Stale details",
      topic_notes: "Stale topic notes",
      essay: "Essay response",
    },
  });

  const snapshot = snapshotFromState(definition, answers, {
    terms: true,
    updates: false,
    conduct: true,
  });

  expect(snapshot.answers).toEqual({
    name: "Ada",
    track: "alpha",
    topics: ["one"],
    source: "friend",
    essay: "Essay response",
  });
  expect(snapshot.agreementKeys).toEqual(["terms", "conduct"]);

  const cleared = snapshotFromState(
    definition,
    { ...answers, name: "", topics: [] },
    {},
  );
  expect(cleared.answers).not.toHaveProperty("name");
  expect(cleared.answers).not.toHaveProperty("topics");
  expect(cleared.agreementKeys).toEqual([]);
});

test("captures the latest raw FormData with active conditions and checked ids", () => {
  const data = new FormData();
  data.set("question:name", "  Ada Lovelace  ");
  data.set("question:track", "alpha");
  data.append("question:topics", "one");
  data.append("question:topics", "other");
  data.set("question:topic_notes", "  Topic notes  ");
  data.set("question:source", "other");
  data.set("question:details", "  More details  ");
  data.set("question:essay", words(160));
  data.set("question:unknown", "ignored");
  data.set("agreement:terms", "yes");
  data.set("agreement:conduct", "yes");
  data.set("draft_revision", "9");

  const snapshot = snapshotFromFormData(definition, data);

  expect(snapshot.answers).toEqual({
    name: "  Ada Lovelace  ",
    track: "alpha",
    topics: ["one", "other"],
    topic_notes: "  Topic notes  ",
    source: "other",
    details: "  More details  ",
    essay: words(160),
  });
  expect(snapshot.agreementKeys).toEqual(["terms", "conduct"]);
  expect(snapshot.answers).not.toHaveProperty("unknown");
});

test("FormData capture skips inactive conditional fields", () => {
  const data = new FormData();
  data.set("question:name", "Ada");
  data.set("question:track", "alpha");
  data.set("question:topics", "one");
  data.set("question:details", "Should not be included");
  data.set("question:topic_notes", "Should not be included");
  data.set("question:source", "friend");

  const snapshot = snapshotFromFormData(definition, data);

  expect(snapshot.answers.topics).toEqual(["one"]);
  expect(snapshot.answers).not.toHaveProperty("details");
  expect(snapshot.answers).not.toHaveProperty("topic_notes");
});

test("serializes a snapshot into the draft action's FormData contract", () => {
  const source = new FormData();
  source.set("question:name", "  Ada\n");
  source.append("question:topics", "one");
  source.set("question:source", "friend");
  source.set("question:essay", "Essay response");
  source.set("agreement:terms", "yes");

  const snapshot = snapshotFromFormData(definition, source);
  const serialized = draftSnapshotToFormData(snapshot);

  expect(serialized.getAll("question:name")).toEqual(["  Ada\n"]);
  expect(serialized.getAll("question:topics")).toEqual(["one"]);
  expect(serialized.getAll("question:source")).toEqual(["friend"]);
  expect(serialized.getAll("question:essay")).toEqual(["Essay response"]);
  expect(serialized.getAll("agreement:terms")).toEqual(["yes"]);
  expect(serialized.getAll("agreement:conduct")).toEqual([]);
});

test("accepts a non-empty draft without a top-level FormData field", () => {
  const data = new FormData();
  data.append("question:name", "Ada");
  const snapshot = snapshotFromFormData(definition, data);
  expect(snapshot.answers.name).toBe("Ada");
});

test("keeps a stable placeholder acceptance timestamp", () => {
  expect(DRAFT_VALIDATION_ACCEPTED_AT).toBe("1970-01-01T00:00:00.000Z");
});

test("restores boolean radio strings for simple definitions", () => {
  const simple: EventForm = {
    title: "Simple",
    questions: [
      {
        id: "has_team",
        kind: "boolean",
        label: "Has a team",
        required: true,
      },
    ],
    agreements: [],
  };

  const answers = restoreAnswers(simple, {
    answers: { has_team: "false" },
  });
  expect(answers.has_team).toBe("false");

  const data = new FormData();
  data.set("question:has_team", "false");
  expect(snapshotFromFormData(simple, data).answers).toEqual({
    has_team: "false",
  });
});
