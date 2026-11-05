// Validates an event registration submission against its trusted definition.

import {
  isQuestionActive,
  type AcceptedAgreement,
  type EventForm,
  type EventFormQuestion,
  type RegistrationAnswers,
  type ValidationResult,
} from "./form-definition";

const QUESTION_PREFIX = "question:";
const AGREEMENT_PREFIX = "agreement:";

const REQUIRED_MESSAGE = "This field is required.";
const DUPLICATE_QUESTION_MESSAGE = "Submit this field only once.";
const DUPLICATE_SELECTION_MESSAGE = "Submit each option only once.";
const DUPLICATE_AGREEMENT_MESSAGE = "Submit this agreement only once.";
const NON_TEXT_MESSAGE = "Submit a text value for this field.";
const INVALID_BOOLEAN_MESSAGE = "Choose yes or no.";
const INVALID_OPTION_MESSAGE = "Choose one of the available options.";
const EXCLUSIVE_OPTION_MESSAGE =
  "Do not combine this option with other choices.";
const AGREEMENT_MESSAGE = "Check this agreement to continue.";
const UNKNOWN_FIELD_MESSAGE = "Unknown field.";

type AnswerValue = RegistrationAnswers[string];

function textLength(value: string): number {
  return Array.from(value).length;
}

function validateQuestion(
  question: EventFormQuestion,
  values: ReadonlyArray<FormDataEntryValue>,
  required: boolean,
  field: string,
  fieldErrors: Map<string, string>,
): AnswerValue | undefined {
  if (values.length === 0) {
    if (required) fieldErrors.set(field, REQUIRED_MESSAGE);
    return undefined;
  }

  if (question.kind === "multiselect") {
    const selected: string[] = [];
    for (const value of values) {
      if (typeof value !== "string") {
        fieldErrors.set(field, NON_TEXT_MESSAGE);
        return undefined;
      }
      selected.push(value);
    }

    if (new Set(selected).size !== selected.length) {
      fieldErrors.set(field, DUPLICATE_SELECTION_MESSAGE);
      return undefined;
    }

    const choices = new Set(question.choices.map((choice) => choice.value));
    if (selected.some((value) => !choices.has(value))) {
      fieldErrors.set(field, INVALID_OPTION_MESSAGE);
      return undefined;
    }

    const exclusiveValues = new Set(question.exclusiveValues ?? []);
    if (
      selected.some((value) => exclusiveValues.has(value)) &&
      selected.some((value) => !exclusiveValues.has(value))
    ) {
      fieldErrors.set(field, EXCLUSIVE_OPTION_MESSAGE);
      return undefined;
    }

    return selected;
  }

  if (values.length > 1) {
    fieldErrors.set(field, DUPLICATE_QUESTION_MESSAGE);
    return undefined;
  }

  const value = values[0];
  if (typeof value !== "string") {
    fieldErrors.set(field, NON_TEXT_MESSAGE);
    return undefined;
  }

  if (question.kind === "boolean") {
    if (value !== "true" && value !== "false") {
      fieldErrors.set(field, INVALID_BOOLEAN_MESSAGE);
      return undefined;
    }
    return value === "true";
  }

  if (question.kind === "select") {
    if (value === "") {
      if (required) fieldErrors.set(field, REQUIRED_MESSAGE);
      return undefined;
    }
    if (!question.choices.some((choice) => choice.value === value)) {
      fieldErrors.set(field, INVALID_OPTION_MESSAGE);
      return undefined;
    }
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    if (required) fieldErrors.set(field, REQUIRED_MESSAGE);
    return undefined;
  }
  if (textLength(trimmed) > question.maxLength) {
    fieldErrors.set(
      field,
      `Use ${question.maxLength} characters or fewer.`,
    );
    return undefined;
  }
  return trimmed;
}

export function validateRegistration(
  definition: EventForm,
  data: FormData,
  acceptedAt: string,
): ValidationResult {
  const questions = new Map(
    definition.questions.map((question) => [question.id, question]),
  );
  const agreements = new Map(
    definition.agreements.map((agreement) => [agreement.id, agreement]),
  );
  const fieldErrors = new Map<string, string>();
  const answers = new Map<string, AnswerValue>();
  const conditionalQuestions: EventFormQuestion[] = [];
  const acceptedAgreements: AcceptedAgreement[] = [];

  const inspectedFields = new Set<string>();
  for (const key of data.keys()) {
    if (inspectedFields.has(key)) continue;
    inspectedFields.add(key);

    if (key.startsWith(QUESTION_PREFIX)) {
      if (!questions.has(key.slice(QUESTION_PREFIX.length))) {
        fieldErrors.set(key, UNKNOWN_FIELD_MESSAGE);
      }
    } else if (key.startsWith(AGREEMENT_PREFIX)) {
      if (!agreements.has(key.slice(AGREEMENT_PREFIX.length))) {
        fieldErrors.set(key, UNKNOWN_FIELD_MESSAGE);
      }
    }
  }

  // Validate unconditional questions first so conditions can only read trusted,
  // already-validated answers regardless of submission or definition order.
  for (const question of definition.questions) {
    if (question.requiredWhen) {
      conditionalQuestions.push(question);
      continue;
    }

    const field = `${QUESTION_PREFIX}${question.id}`;
    const answer = validateQuestion(
      question,
      data.getAll(field),
      question.required,
      field,
      fieldErrors,
    );
    if (answer !== undefined) answers.set(question.id, answer);
  }

  const validatedAnswers: RegistrationAnswers = Object.fromEntries(answers);

  for (const question of conditionalQuestions) {
    if (!isQuestionActive(question, validatedAnswers)) continue;

    const field = `${QUESTION_PREFIX}${question.id}`;
    const answer = validateQuestion(
      question,
      data.getAll(field),
      true,
      field,
      fieldErrors,
    );
    if (answer !== undefined) answers.set(question.id, answer);
  }

  for (const agreement of definition.agreements) {
    const field = `${AGREEMENT_PREFIX}${agreement.id}`;
    const values = data.getAll(field);

    if (values.length === 0) {
      if (agreement.required) fieldErrors.set(field, AGREEMENT_MESSAGE);
      continue;
    }

    if (values.length > 1) {
      fieldErrors.set(field, DUPLICATE_AGREEMENT_MESSAGE);
      continue;
    }

    const value = values[0];
    if (typeof value !== "string" || value !== "yes") {
      fieldErrors.set(field, AGREEMENT_MESSAGE);
      continue;
    }

    acceptedAgreements.push({
      key: agreement.id,
      text: agreement.text,
      accepted_at: acceptedAt,
    });
  }

  if (fieldErrors.size > 0) {
    return { ok: false, fieldErrors: Object.fromEntries(fieldErrors) };
  }

  return {
    ok: true,
    answers: Object.fromEntries(answers) as RegistrationAnswers,
    acceptedAgreements,
  };
}
