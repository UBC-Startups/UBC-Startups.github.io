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
      technical_skills: ["spreadsheets", "unknown", "spreadsheets"],
      hackathon_experience: "three_to_five_or_two_top_three",
      dietary_restrictions: ["vegetarian", "unknown", "vegetarian"],
      referral_source: "other",
      referral_other: "\tA friend's poster  ",
      participation_motivation: motivation,
      team_contribution: "Contribution",
      problem_solution: "Problem response",
      preferred_teammates: "Ada Lovelace",
      retired_question: "ignore me",
    },
  });

  expect(answers.faculty).toBe("science");
  expect(answers.major).toBe("  Computer Science\n");
  expect(answers.year_of_study).toBe("2");
  expect(answers.technical_skills).toEqual(["spreadsheets"]);
  expect(answers.hackathon_experience).toBe(
    "three_to_five_or_two_top_three",
  );
  expect(answers.dietary_restrictions).toEqual(["vegetarian"]);
  expect(answers.referral_source).toBe("other");
  expect(answers.referral_other).toBe("\tA friend's poster  ");
  expect(answers.participation_motivation).toBe(motivation);
  expect(answers.team_contribution).toBe("Contribution");
  expect(answers.problem_solution).toBe("Problem response");
  expect(answers.preferred_teammates).toBe("Ada Lovelace");
  expect(answers).not.toHaveProperty("dietary_details");
  expect(answers).not.toHaveProperty("technical_skills_details");
  expect(answers).not.toHaveProperty("retired_question");
});

test("keeps unrelated answers from an old draft and leaves the new hackathon bracket blank", () => {
  const answers = restoreAnswers(definition, {
    answers: {
      faculty: "science",
      major: "Computer Science",
      year_of_study: "2",
      previous_hackathons: "2_3",
      technical_skills: ["programming"],
      dietary_restrictions: ["none"],
      referral_source: "friend",
      participation_motivation: "Old motivation",
      team_contribution: "Old contribution",
    },
  });

  expect(answers.hackathon_experience).toBe("");
  expect(answers).not.toHaveProperty("previous_hackathons");
  expect(answers.faculty).toBe("science");
  expect(answers.major).toBe("Computer Science");
  expect(answers.year_of_study).toBe("2");
  expect(answers.technical_skills).toEqual(["programming"]);
  expect(answers.dietary_restrictions).toEqual(["none"]);
  expect(answers.referral_source).toBe("friend");
  expect(answers.participation_motivation).toBe("Old motivation");
  expect(answers.team_contribution).toBe("Old contribution");

  const snapshot = snapshotFromState(definition, answers, {});
  expect(snapshot.answers).not.toHaveProperty("previous_hackathons");
  expect(snapshot.answers).not.toHaveProperty("hackathon_experience");
  expect(snapshot.answers.faculty).toBe("science");
});

test("drops restored conditional answers whose controlling answer is inactive", () => {
  const answers = restoreAnswers(definition, {
    answers: {
      faculty: "arts",
      major: "History",
      year_of_study: "1",
      technical_skills: ["programming"],
      technical_skills_details: "Stale other skills",
      hackathon_experience: "first_hackathon",
      dietary_restrictions: ["none"],
      dietary_details: "Stale allergy details",
      referral_source: "instagram",
      referral_other: "Stale referral detail",
    },
  });

  expect(answers).not.toHaveProperty("technical_skills_details");
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
      technical_skills: ["programming"],
      hackathon_experience: "first_hackathon",
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
    technical_skills: ["programming"],
    hackathon_experience: "first_hackathon",
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
  data.append("question:technical_skills", "programming");
  data.append("question:technical_skills", "other");
  data.set("question:technical_skills_details", "  Figma and CAD  ");
  data.set("question:hackathon_experience", "six_plus_or_four_top_three");
  data.append("question:dietary_restrictions", "food_allergy");
  data.append("question:dietary_restrictions", "vegetarian");
  data.set("question:dietary_details", "  Peanuts\n");
  data.set("question:referral_source", "other");
  data.set("question:referral_other", "  A poster  ");
  data.set("question:participation_motivation", words(151));
  data.set("question:team_contribution", "  Contribution  ");
  data.set("question:problem_solution", words(150));
  data.set("question:preferred_teammates", "  Ada Lovelace  ");
  data.set("question:unknown", "ignored");
  data.set("agreement:application_status", "yes");
  data.set("agreement:participant_conduct", "yes");
  data.set("draft_revision", "9");

  const snapshot = snapshotFromFormData(definition, data);

  expect(snapshot.answers).toEqual({
    faculty: "science",
    major: "  Computer Science  ",
    year_of_study: "1",
    technical_skills: ["programming", "other"],
    technical_skills_details: "  Figma and CAD  ",
    hackathon_experience: "six_plus_or_four_top_three",
    dietary_restrictions: ["food_allergy", "vegetarian"],
    dietary_details: "  Peanuts\n",
    referral_source: "other",
    referral_other: "  A poster  ",
    participation_motivation: words(151),
    team_contribution: "  Contribution  ",
    problem_solution: words(150),
    preferred_teammates: "  Ada Lovelace  ",
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
  data.set("question:technical_skills", "programming");
  data.set("question:technical_skills_details", "Should not be included");
  data.set("question:hackathon_experience", "first_hackathon");
  data.set("question:dietary_restrictions", "none");
  data.set("question:dietary_details", "Should not be included");
  data.set("question:referral_source", "instagram");
  data.set("question:referral_other", "Should not be included");

  const snapshot = snapshotFromFormData(definition, data);

  expect(snapshot.answers.dietary_restrictions).toEqual(["none"]);
  expect(snapshot.answers).not.toHaveProperty("technical_skills_details");
  expect(snapshot.answers).not.toHaveProperty("dietary_details");
  expect(snapshot.answers).not.toHaveProperty("referral_other");
});

test("serializes a snapshot into the draft action's FormData contract", () => {
  const source = new FormData();
  source.set("question:major", "  Ada\n");
  source.append("question:technical_skills", "programming");
  source.set("question:hackathon_experience", "one_or_two");
  source.append("question:dietary_restrictions", "none");
  source.set("question:preferred_teammates", "  Grace Hopper  ");
  source.set("agreement:application_status", "yes");

  const snapshot = snapshotFromFormData(definition, source);
  const serialized = draftSnapshotToFormData(snapshot);

  expect(serialized.getAll("question:major")).toEqual(["  Ada\n"]);
  expect(serialized.getAll("question:technical_skills")).toEqual([
    "programming",
  ]);
  expect(serialized.getAll("question:hackathon_experience")).toEqual([
    "one_or_two",
  ]);
  expect(serialized.getAll("question:dietary_restrictions")).toEqual(["none"]);
  expect(serialized.getAll("question:preferred_teammates")).toEqual([
    "  Grace Hopper  ",
  ]);
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
