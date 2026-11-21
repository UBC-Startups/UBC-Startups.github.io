import { expect, test } from "@playwright/test";
import { getEventForm } from "../../../../data/event-forms";
import { validateRegistration } from "../../../../lib/events/validate-registration";

const acceptedAt = "2026-11-04T12:00:00.000Z";

function formValues(fields: Record<string, string | string[] | File>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    for (const entry of Array.isArray(value) ? value : [value]) {
      data.append(key, entry);
    }
  }
  return data;
}

test("defines the CaseHack background, event, and application contract", () => {
  const form = getEventForm("casehack-2026");
  if (!form) throw new Error("CaseHack form is missing.");
  const questions = new Map(
    form.questions.map((question) => [question.id, question]),
  );

  expect(questions.has("program")).toBe(false);
  expect(questions.has("previous_hackathons")).toBe(false);

  const faculty = questions.get("faculty");
  expect(faculty).toMatchObject({
    kind: "select",
    label: "Faculty / school",
    required: true,
  });
  if (faculty?.kind !== "select") throw new Error("Faculty must be a select.");
  expect(faculty.choices.some((choice) => choice.value === "other")).toBe(true);

  const major = questions.get("major");
  expect(major).toEqual({
    id: "major",
    kind: "text",
    label: "Major / program",
    required: true,
    maxLength: 120,
  });
  expect(major).not.toHaveProperty("section");

  const technicalSkills = questions.get("technical_skills");
  expect(technicalSkills).toMatchObject({
    kind: "multiselect",
    label: "Which technical skills do you have?",
    required: true,
  });
  expect(technicalSkills).not.toHaveProperty("section");
  if (technicalSkills?.kind !== "multiselect") {
    throw new Error("Technical skills must be a multiselect.");
  }
  expect(technicalSkills.choices).toEqual([
    { value: "spreadsheets", label: "Excel or Google Sheets" },
    {
      value: "data_visualization",
      label: "Creating charts/dashboards and interpreting data",
    },
    { value: "ui_ux_prototyping", label: "UI/UX design and prototyping" },
    { value: "programming", label: "Python/JavaScript/Java/C++" },
    { value: "other", label: "Other" },
  ]);

  const technicalDetails = questions.get("technical_skills_details");
  expect(technicalDetails).toMatchObject({
    kind: "textarea",
    label: "Please describe your other technical skills.",
    required: false,
    maxLength: 500,
    requiredWhen: {
      questionId: "technical_skills",
      includesAny: ["other"],
    },
  });
  expect(technicalDetails).not.toHaveProperty("section");

  const hackathonExperience = questions.get("hackathon_experience");
  expect(hackathonExperience).toMatchObject({
    kind: "select",
    label: "What is your hackathon experience?",
    required: true,
    section: "event",
  });
  if (hackathonExperience?.kind !== "select") {
    throw new Error("Hackathon experience must be a select.");
  }
  expect(hackathonExperience.choices).toEqual([
    { value: "first_hackathon", label: "First hackathon" },
    { value: "one_or_two", label: "1–2" },
    {
      value: "three_to_five_or_two_top_three",
      label: "3–5 (or 2+ top-three finishes)",
    },
    {
      value: "six_plus_or_four_top_three",
      label: "6+ (or 4+ top-three finishes)",
    },
  ]);

  const motivation = questions.get("participation_motivation");
  expect(motivation).toMatchObject({
    kind: "textarea",
    label: "Why do you want to participate in CaseHack?",
    required: true,
    section: "application",
    maxWords: 150,
  });
  expect(motivation).not.toHaveProperty("maxLength");

  const contribution = questions.get("team_contribution");
  expect(contribution).toMatchObject({
    kind: "textarea",
    label: "What would you bring to a team?",
    required: true,
    section: "application",
    maxWords: 150,
  });
  expect(contribution).not.toHaveProperty("maxLength");

  const problemSolution = questions.get("problem_solution");
  expect(problemSolution).toMatchObject({
    kind: "textarea",
    label:
      "Describe a problem you noticed in everyday life, on campus, or in your community. What would you build to solve it, and why?",
    required: true,
    section: "application",
    maxWords: 149,
  });
  expect(problemSolution).not.toHaveProperty("maxLength");

  const preferredTeammates = questions.get("preferred_teammates");
  expect(preferredTeammates).toMatchObject({
    kind: "textarea",
    required: false,
    section: "application",
    maxLength: 500,
  });
  if (preferredTeammates?.kind !== "textarea") {
    throw new Error("Preferred teammates must be a textarea.");
  }
  expect(preferredTeammates.label).toContain("Preferred teammates");
  expect(preferredTeammates.label).toContain("preference");

  const expectedSections: Record<string, string> = {
    faculty: "background",
    major: "background",
    year_of_study: "background",
    technical_skills: "background",
    technical_skills_details: "background",
    hackathon_experience: "event",
    dietary_restrictions: "event",
    dietary_details: "event",
    referral_source: "event",
    referral_other: "event",
    participation_motivation: "application",
    team_contribution: "application",
    problem_solution: "application",
    preferred_teammates: "application",
  };

  expect([...questions.keys()].sort()).toEqual(
    Object.keys(expectedSections).sort(),
  );

  for (const question of form.questions) {
    expect(question.section ?? "background").toBe(
      expectedSections[question.id],
    );
  }
});

test("validates a complete CaseHack application against the agreed contract", () => {
  const form = getEventForm("casehack-2026");
  if (!form) throw new Error("CaseHack form is missing.");

  const result = validateRegistration(
    form,
    formValues({
      "question:faculty": "science",
      "question:major": "Computer Science",
      "question:year_of_study": "3",
      "question:technical_skills": [
        "programming",
        "spreadsheets",
        "other",
      ],
      "question:technical_skills_details":
        "I also build dashboards in Tableau and prototype interfaces in Figma.",
      "question:hackathon_experience": "three_to_five_or_two_top_three",
      "question:dietary_restrictions": ["vegetarian", "food_allergy"],
      "question:dietary_details": "Peanuts",
      "question:referral_source": "other",
      "question:referral_other": "A friend's poster",
      "question:participation_motivation":
        "I want to build something useful with a team and learn how experienced mentors approach a real problem.",
      "question:team_contribution":
        "I bring calm prototyping, frontend skills, and experience turning interview notes into a clear product direction.",
      "question:problem_solution":
        "Students cannot find free study space between classes. I would build a live room map that shows current availability and quiet zones, so people can plan a place to work without walking across campus.",
      "question:preferred_teammates": "Ada Lovelace",
      "agreement:application_status": "yes",
      "agreement:participant_conduct": "yes",
      "agreement:application_data": "yes",
      "agreement:photo_video_consent": "yes",
      "agreement:submission_finality": "yes",
    }),
    acceptedAt,
  );

  expect(result).toEqual({
    ok: true,
    answers: {
      faculty: "science",
      major: "Computer Science",
      year_of_study: "3",
      technical_skills: ["programming", "spreadsheets", "other"],
      technical_skills_details:
        "I also build dashboards in Tableau and prototype interfaces in Figma.",
      hackathon_experience: "three_to_five_or_two_top_three",
      dietary_restrictions: ["vegetarian", "food_allergy"],
      dietary_details: "Peanuts",
      referral_source: "other",
      referral_other: "A friend's poster",
      participation_motivation:
        "I want to build something useful with a team and learn how experienced mentors approach a real problem.",
      team_contribution:
        "I bring calm prototyping, frontend skills, and experience turning interview notes into a clear product direction.",
      problem_solution:
        "Students cannot find free study space between classes. I would build a live room map that shows current availability and quiet zones, so people can plan a place to work without walking across campus.",
      preferred_teammates: "Ada Lovelace",
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
      {
        key: "submission_finality",
        text: "I understand that I will not be able to change my answers after submission.",
        accepted_at: acceptedAt,
      },
    ],
  });
});
