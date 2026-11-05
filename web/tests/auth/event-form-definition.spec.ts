import { expect, test } from "@playwright/test";
import { getEventForm, getEventForms } from "../../data/event-forms";
import {
  isQuestionActive,
  type EventForm,
  type EventFormQuestion,
} from "../../lib/events/form-definition";
import { validateRegistration } from "../../lib/events/validate-registration";

test("resolves the CaseHack edition and rejects unknown or prototype slugs", () => {
  expect(getEventForm("casehack-2026")).toBeDefined();

  for (const slug of [
    "unknown-event",
    "__proto__",
    "prototype",
    "constructor",
    "toString",
  ]) {
    expect(getEventForm(slug)).toBeUndefined();
  }
});

function expectValidDefinition(form: EventForm) {
  const questionIds = form.questions.map((question) => question.id);
  expect(new Set(questionIds).size).toBe(questionIds.length);

  const agreementIds = form.agreements.map((agreement) => agreement.id);
  expect(new Set(agreementIds).size).toBe(agreementIds.length);

  const questions = new Map(
    form.questions.map((question) => [question.id, question]),
  );

  for (const question of form.questions) {
    if (question.kind === "text" || question.kind === "textarea") {
      expect(Number.isInteger(question.maxLength)).toBe(true);
      expect(question.maxLength).toBeGreaterThan(0);
    }

    if (question.kind === "select" || question.kind === "multiselect") {
      const values = question.choices.map((choice) => choice.value);
      expect(new Set(values).size).toBe(values.length);
    }

    if (question.kind === "multiselect") {
      const values = question.choices.map((choice) => choice.value);
      for (const exclusive of question.exclusiveValues ?? []) {
        expect(values).toContain(exclusive);
      }
    }

    const condition = question.requiredWhen;
    if (condition) {
      expect(question.required).toBe(false);
      expect(condition.includesAny.length).toBeGreaterThan(0);

      const controlling = questions.get(condition.questionId);
      expect(controlling).toBeDefined();
      if (!controlling) continue;

      expect(controlling.requiredWhen).toBeUndefined();
      expect(["select", "multiselect"]).toContain(controlling.kind);
      if (controlling.kind !== "select" && controlling.kind !== "multiselect") {
        continue;
      }

      const values = controlling.choices.map((choice) => choice.value);
      for (const trigger of condition.includesAny) {
        expect(values).toContain(trigger);
      }
    }
  }
}

test("activates conditional questions from validated answers", () => {
  const question: EventFormQuestion = {
    id: "details",
    kind: "text",
    label: "Details",
    required: false,
    maxLength: 10,
    requiredWhen: {
      questionId: "source",
      includesAny: ["other"],
    },
  };

  expect(isQuestionActive(question, {})).toBe(false);
  expect(isQuestionActive(question, { source: "other" })).toBe(true);
  expect(isQuestionActive(question, { source: "friend" })).toBe(false);
  expect(isQuestionActive(question, { source: ["other", "friend"] })).toBe(
    true,
  );
  expect(isQuestionActive(question, { source: ["friend"] })).toBe(false);
  expect(isQuestionActive(question, { source: false })).toBe(false);
});

const registeredEventForms = getEventForms();

test("registers at least one event form", () => {
  expect(registeredEventForms.length).toBeGreaterThan(0);
});

for (const [slug, form] of registeredEventForms) {
  test(`defines unique keys, text limits, and select choices for ${slug}`, () => {
    expectValidDefinition(form);
  });
}

