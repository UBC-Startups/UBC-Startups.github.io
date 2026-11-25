// Fixed signup form definitions keyed by the event edition slug.

import type { EventForm } from "../lib/events/form-definition";
import { ubcVancouverFaculties } from "./ubc-vancouver-faculties";

const facultyChoices = [
  ...ubcVancouverFaculties.map((faculty) => ({
    value: faculty.value,
    label: faculty.label,
  })),
  { value: "other", label: "Other" },
];

const eventForms = new Map<string, EventForm>([
  [
    "casehack-2026",
    {
      title: "CaseHack",
      blurb:
        "Two days, one real-world challenge, and a team with complementary skills. Apply below.",
      questions: [
        {
          id: "faculty",
          label: "Faculty / school",
          required: true,
          kind: "select",
          choices: facultyChoices,
        },
        {
          id: "major",
          label: "Major / program",
          required: true,
          kind: "text",
          maxLength: 120,
        },
        {
          id: "year_of_study",
          label: "What year of study are you in?",
          required: true,
          kind: "select",
          choices: [
            { value: "1", label: "First year" },
            { value: "2", label: "Second year" },
            { value: "3", label: "Third year" },
            { value: "4", label: "Fourth year" },
            { value: "5_plus", label: "Fifth year or higher" },
          ],
        },
        {
          id: "technical_skills",
          label: "Which technical skills do you have?",
          required: true,
          kind: "multiselect",
          choices: [
            { value: "spreadsheets", label: "Excel or Google Sheets" },
            {
              value: "data_visualization",
              label: "Creating charts/dashboards and interpreting data",
            },
            {
              value: "ui_ux_prototyping",
              label: "UI/UX design and prototyping",
            },
            { value: "programming", label: "Python/JavaScript/Java/C++" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "technical_skills_details",
          label: "Please describe your other technical skills.",
          required: false,
          kind: "textarea",
          maxLength: 500,
          requiredWhen: {
            questionId: "technical_skills",
            includesAny: ["other"],
          },
        },
        {
          id: "hackathon_experience",
          label: "What is your hackathon experience?",
          required: true,
          kind: "select",
          section: "event",
          choices: [
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
          ],
        },
        {
          id: "dietary_restrictions",
          label: "Do you have any dietary restrictions?",
          required: true,
          kind: "multiselect",
          section: "event",
          exclusiveValues: ["none"],
          choices: [
            { value: "none", label: "No dietary restrictions" },
            { value: "vegetarian", label: "Vegetarian" },
            { value: "vegan", label: "Vegan" },
            { value: "halal", label: "Halal" },
            { value: "gluten_free", label: "Gluten-free" },
            { value: "food_allergy", label: "Food allergy" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "dietary_details",
          label: "Please describe your dietary restrictions or allergy.",
          required: false,
          kind: "textarea",
          section: "event",
          maxLength: 500,
          requiredWhen: {
            questionId: "dietary_restrictions",
            includesAny: ["food_allergy", "other"],
          },
        },
        {
          id: "referral_source",
          label: "How did you hear about CaseHack?",
          required: false,
          kind: "select",
          section: "event",
          choices: [
            { value: "instagram", label: "Instagram" },
            { value: "linkedin", label: "LinkedIn" },
            { value: "mailing_list", label: "Mailing list" },
            { value: "friend", label: "Friend" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "referral_other",
          label: "Please tell us how you heard about CaseHack.",
          required: false,
          kind: "text",
          section: "event",
          maxLength: 120,
          requiredWhen: {
            questionId: "referral_source",
            includesAny: ["other"],
          },
        },
        {
          id: "participation_motivation",
          label: "Why do you want to participate in CaseHack?",
          required: true,
          kind: "textarea",
          section: "application",
          maxWords: 150,
        },
        {
          id: "team_contribution",
          label: "What would you bring to a team?",
          required: true,
          kind: "textarea",
          section: "application",
          maxWords: 150,
        },
        {
          id: "problem_solution",
          label:
            "Describe a problem you noticed in everyday life, on campus, or in your community. What would you build to solve it, and why?",
          required: true,
          kind: "textarea",
          section: "application",
          maxWords: 149,
        },
        {
          id: "preferred_teammates",
          label:
            "Preferred teammates (optional). List the full names of other applicants you’d like to work with. We’ll treat your list as a preference.",
          required: false,
          kind: "textarea",
          section: "application",
          maxLength: 500,
        },
      ],
      agreements: [
        {
          id: "application_status",
          label: "Application status",
          text: "I understand that submitting this application does not confirm my place at CaseHack. UBC Startups will contact me about my application outcome.",
          required: true,
        },
        {
          id: "participant_conduct",
          label: "Participant conduct",
          text: "I agree to treat participants, organizers, mentors, and judges respectfully, avoid harassment and discrimination, and follow reasonable instructions from event organizers.",
          required: true,
        },
        {
          id: "application_data",
          label: "Application data",
          text: "I understand that UBC Startups will use the information I submit to review my application, organize CaseHack, plan food, and contact me about the event.",
          required: true,
        },
        {
          id: "photo_video_consent",
          label: "Photo and video consent",
          text: "I consent to photographs and videos of me being taken during CaseHack and used by UBC Startups to promote CaseHack through its website and social media channels.",
          required: true,
        },
        {
          id: "submission_finality",
          label: "Final submission",
          text: "I understand that I will not be able to change my answers after submission.",
          required: true,
        },
      ],
    },
  ],
]);

export function getEventForm(slug: string): EventForm | undefined {
  return eventForms.get(slug);
}

export function getEventForms(): Array<[string, EventForm]> {
  return Array.from(eventForms.entries());
}
