import { expect, test } from "@playwright/test";
import { getEventForm } from "../../../data/event-forms";
import type { EventForm } from "../../../lib/events/form-definition";
import {
  DRAFT_VALIDATION_ACCEPTED_AT,
  draftSnapshotToFormData,
  restoreAgreements,
  restoreAnswers,
  snapshotFromFormData,
  snapshotFromState,
} from "../../../views/registration/registration-draft";

const definition = getEventForm("casehack-2026");
if (!definition) throw new Error("CaseHack fixture definition is missing.");

function words(count: number): string {
  return Array.from({ length: count }, (_, index) => `word${index}`).join(" ");
}

test("restores known draft answers and preserves raw whitespace and long text", () => {
  const motivation = `  ${words(151)}  `;
  const answers = restoreAnswers(definition, {
    answers: {
      faculty: "science",
      major: "  Computer Science\n",
      year_of_study: "2",
      previous_hackathons: "2_3",
      dietary_restrictions: ["vegetarian", "unknown", "vegetarian"],
      referral_source: "other",
      referral_other: "\tA friend's poster  ",
      participation_motivation: motivation,
      team_contribution: "Contribution",
      retired_question: "ignore me",
    },
  });

  expect(answers.faculty).toBe("science");
  expect(answers.major).toBe("  Computer Science\n");
  expect(answers.year_of_study).toBe("2");
  expect(answers.previous_hackathons).toBe("2_3");
  expect(answers.dietary_restrictions).toEqual(["vegetarian"]);
  expect(answers.referral_source).toBe("other");
  expect(answers.referral_other).toBe("\tA friend's poster  ");
  expect(answers.participation_motivation).toBe(motivation);
  expect(answers.team_contribution).toBe("Contribution");
  expect(answers).not.toHaveProperty("dietary_details");
  expect(answers).not.toHaveProperty("retired_question");
});

test("drops restored conditional answers whose controlling answer is inactive", () => {
  const answers = restoreAnswers(definition, {
    answers: {
      faculty: "arts",
      major: "History",
      year_of_study: "1",
      previous_hackathons: "0",
      dietary_restrictions: ["none"],
      dietary_details: "Stale allergy details",
      referral_source: "instagram",
      referral_other: "Stale referral detail",
    },
  });

  expect(answers).not.toHaveProperty("dietary_details");
  expect(answers).not.toHaveProperty("referral_other");
});

test("restores only agreement ids that still exist in the definition", () => {
  const agreements = restoreAgreements(definition, {
    agreementKeys: [
      "application_status",
      "removed_agreement",
      "application_status",
    ],
  });

  expect(agreements.application_status).toBe(true);
  expect(agreements.participant_conduct).toBe(false);
  expect(agreements).not.toHaveProperty("removed_agreement");
});

test("state snapshots omit cleared fields and inactive conditional answers", () => {
  const answers = restoreAnswers(definition, {
    answers: {
      faculty: "science",
      major: "Computer Science",
      year_of_study: "1",
      previous_hackathons: "0",
      dietary_restrictions: ["none"],
      dietary_details: "Stale",
      referral_source: "",
    },
  });

  const snapshot = snapshotFromState(definition, answers, {
    application_status: true,
    participant_conduct: false,
    application_data: true,
    photo_video_consent: false,
    submission_finality: false,
  });

  expect(snapshot.answers).toEqual({
    faculty: "science",
    major: "Computer Science",
    year_of_study: "1",
    previous_hackathons: "0",
    dietary_restrictions: ["none"],
  });
  expect(snapshot.agreementKeys).toEqual([
    "application_status",
    "application_data",
  ]);

  const cleared = snapshotFromState(
    definition,
    { ...answers, major: "", dietary_restrictions: [] },
    {},
  );
  expect(cleared.answers).not.toHaveProperty("major");
  expect(cleared.answers).not.toHaveProperty("dietary_restrictions");
  expect(cleared.agreementKeys).toEqual([]);
});

test("captures the latest raw FormData with active conditions and checked ids", () => {
  const data = new FormData();
  data.set("question:faculty", "science");
  data.set("question:major", "  Computer Science  ");
  data.set("question:year_of_study", "1");
  data.set("question:previous_hackathons", "0");
  data.append("question:dietary_restrictions", "food_allergy");
  data.append("question:dietary_restrictions", "vegetarian");
  data.set("question:dietary_details", "  Peanuts\n");
  data.set("question:referral_source", "other");
  data.set("question:referral_other", "  A poster  ");
  data.set("question:participation_motivation", words(151));
  data.set("question:team_contribution", "  Contribution  ");
  data.set("question:unknown", "ignored");
  data.set("agreement:application_status", "yes");
  data.set("agreement:participant_conduct", "yes");
  data.set("draft_revision", "9");

  const snapshot = snapshotFromFormData(definition, data);

  expect(snapshot.answers).toEqual({
    faculty: "science",
    major: "  Computer Science  ",
    year_of_study: "1",
    previous_hackathons: "0",
    dietary_restrictions: ["food_allergy", "vegetarian"],
    dietary_details: "  Peanuts\n",
    referral_source: "other",
    referral_other: "  A poster  ",
    participation_motivation: words(151),
    team_contribution: "  Contribution  ",
  });
  expect(snapshot.agreementKeys).toEqual([
    "application_status",
    "participant_conduct",
  ]);
  expect(snapshot.answers).not.toHaveProperty("unknown");
});

test("FormData capture skips inactive conditional fields", () => {
  const data = new FormData();
  data.set("question:faculty", "arts");
  data.set("question:major", "History");
  data.set("question:year_of_study", "1");
  data.set("question:previous_hackathons", "0");
  data.set("question:dietary_restrictions", "none");
  data.set("question:dietary_details", "Should not be included");
  data.set("question:referral_source", "instagram");
  data.set("question:referral_other", "Should not be included");

  const snapshot = snapshotFromFormData(definition, data);

  expect(snapshot.answers.dietary_restrictions).toEqual(["none"]);
  expect(snapshot.answers).not.toHaveProperty("dietary_details");
  expect(snapshot.answers).not.toHaveProperty("referral_other");
});

test("serializes a snapshot into the draft action's FormData contract", () => {
  const source = new FormData();
  source.set("question:major", "  Ada\n");
  source.append("question:dietary_restrictions", "none");
  source.set("agreement:application_status", "yes");

  const snapshot = snapshotFromFormData(definition, source);
  const serialized = draftSnapshotToFormData(snapshot);

  expect(serialized.getAll("question:major")).toEqual(["  Ada\n"]);
  expect(serialized.getAll("question:dietary_restrictions")).toEqual(["none"]);
  expect(serialized.getAll("agreement:application_status")).toEqual(["yes"]);
  expect(serialized.getAll("agreement:participant_conduct")).toEqual([]);
});

test("accepts a non-empty draft without a top-level FormData field", () => {
  const data = new FormData();
  data.append("question:faculty", "science");
  const snapshot = snapshotFromFormData(definition, data);
  expect(snapshot.answers.faculty).toBe("science");
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
