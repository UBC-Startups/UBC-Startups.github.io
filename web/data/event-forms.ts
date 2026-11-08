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
          id: "previous_hackathons",
          label: "How many hackathons have you participated in before?",
          required: true,
          kind: "select",
          section: "event",
          choices: [
            { value: "0", label: "0" },
            { value: "1", label: "1" },
            { value: "2_3", label: "2–3" },
            { value: "4_5", label: "4–5" },
            { value: "6_plus", label: "6 or more" },
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
