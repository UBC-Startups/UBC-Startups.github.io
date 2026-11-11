// Feature-local conversion between the registration form state, the draft
// snapshot contract, and the native FormData captured at final submission.

import {
  isQuestionActive,
  type EventForm,
  type EventFormQuestion,
} from "@/lib/events/form-definition";
import type {
  RegistrationDraft,
  RegistrationDraftSnapshot,
} from "@/lib/events/registration-result";

export type ClientAnswer = string | string[];
export type Answers = Record<string, ClientAnswer>;
export type Agreements = Record<string, boolean>;

/**
 * Step validation only needs a stable, irrelevant acceptance timestamp. Real
 * accepted times are created by the trusted server action at final submission.
 */
export const DRAFT_VALIDATION_ACCEPTED_AT = "1970-01-01T00:00:00.000Z";

export function initialAnswer(question: EventFormQuestion): ClientAnswer {
  return question.kind === "multiselect" ? [] : "";
}

export function clearInactiveAnswers(
  definition: EventForm,
  answers: Answers,
): Answers {
  const next = { ...answers };
  let changed = true;

  while (changed) {
    changed = false;
    for (const question of definition.questions) {
      if (!question.requiredWhen) continue;
      if (
        Object.prototype.hasOwnProperty.call(next, question.id) &&
        !isQuestionActive(question, next)
      ) {
        delete next[question.id];
        changed = true;
      }
    }
  }

  return next;
}

function restoreAnswer(
  question: EventFormQuestion,
  value: string | string[],
): ClientAnswer | null {
  if (question.kind === "multiselect") {
    if (!Array.isArray(value)) return null;
    const choices = new Set(question.choices.map((choice) => choice.value));
    const selected: string[] = [];
    for (const entry of value) {
      if (typeof entry !== "string" || !choices.has(entry)) continue;
      if (!selected.includes(entry)) selected.push(entry);
    }
    return selected.length > 0 ? selected : null;
  }

  if (typeof value !== "string") return null;

  if (question.kind === "boolean") {
    return value === "true" || value === "false" ? value : null;
  }

  if (question.kind === "select") {
    if (value === "") return "";
    return question.choices.some((choice) => choice.value === value)
      ? value
      : null;
  }

  // Text and textarea drafts restore the exact raw value, including leading or
  // trailing whitespace and text beyond the final submission limits.
  return value;
}

/**
 * Restore controlled answers for the definition's current questions only.
 * Unknown draft keys, obsolete choices, and mis-typed values are ignored.
 */
export function restoreAnswers(
  definition: EventForm,
  draft?: Pick<RegistrationDraft, "answers"> | null,
): Answers {
  const answers: Answers = {};
  for (const question of definition.questions) {
    answers[question.id] = initialAnswer(question);
  }

  if (draft) {
    for (const question of definition.questions) {
      const value = draft.answers[question.id];
      if (value === undefined) continue;
      const restored = restoreAnswer(question, value);
      if (restored !== null) answers[question.id] = restored;
    }
  }

  return clearInactiveAnswers(definition, answers);
}

/** Restore only agreement ids that still exist in the trusted definition. */
export function restoreAgreements(
  definition: EventForm,
  draft?: Pick<RegistrationDraft, "agreementKeys"> | null,
): Agreements {
  const checked = new Set(draft?.agreementKeys ?? []);
  return Object.fromEntries(
    definition.agreements.map((agreement) => [
      agreement.id,
      checked.has(agreement.id),
    ]),
  );
}

/**
 * Build the whole draft snapshot from controlled state. Empty values are
 * omitted so a cleared field is a real replacement of the stored snapshot.
 */
export function snapshotFromState(
  definition: EventForm,
  answers: Answers,
  agreements: Agreements,
): RegistrationDraftSnapshot {
  const snapshotAnswers: RegistrationDraftSnapshot["answers"] = {};

  for (const question of definition.questions) {
    if (!isQuestionActive(question, answers)) continue;

    const value = answers[question.id];
    if (Array.isArray(value)) {
      if (value.length > 0) snapshotAnswers[question.id] = [...value];
    } else if (typeof value === "string" && value !== "") {
      snapshotAnswers[question.id] = value;
    }
  }

  return {
    answers: snapshotAnswers,
    agreementKeys: definition.agreements
      .filter((agreement) => Boolean(agreements[agreement.id]))
      .map((agreement) => agreement.id),
  };
}

function readQuestionFromFormData(
  question: EventFormQuestion,
  data: FormData,
): ClientAnswer | null {
  const field = `question:${question.id}`;
  const values = data.getAll(field);

  if (question.kind === "multiselect") {
    const choices = new Set(question.choices.map((choice) => choice.value));
    const selected: string[] = [];
    for (const value of values) {
      if (typeof value !== "string" || !choices.has(value)) continue;
      if (!selected.includes(value)) selected.push(value);
    }
    return selected.length > 0 ? selected : null;
  }

  if (values.length === 0) return null;
  const value = values[0];
  if (typeof value !== "string" || value === "") return null;
  return value;
}

/**
 * Capture the latest native form values without waiting for a React render.
 * Inactive conditional fields and unknown fields are skipped.
 */
export function snapshotFromFormData(
  definition: EventForm,
  data: FormData,
): RegistrationDraftSnapshot {
  const answers: Answers = {};

  // Validate unconditional answers first so conditions read the same trusted
  // controlling values regardless of DOM order.
  for (const question of definition.questions) {
    if (question.requiredWhen) continue;
    const value = readQuestionFromFormData(question, data);
    if (value !== null) answers[question.id] = value;
  }

  for (const question of definition.questions) {
    if (!question.requiredWhen) continue;
    if (!isQuestionActive(question, answers)) continue;
    const value = readQuestionFromFormData(question, data);
    if (value !== null) answers[question.id] = value;
  }

  const agreementKeys: string[] = [];
  for (const agreement of definition.agreements) {
    const values = data.getAll(`agreement:${agreement.id}`);
    if (values.length === 1 && values[0] === "yes") {
      agreementKeys.push(agreement.id);
    }
  }

  return { answers, agreementKeys };
}

/** Serialize a captured snapshot for the direct draft Server Action call. */
export function draftSnapshotToFormData(
  snapshot: RegistrationDraftSnapshot,
): FormData {
  const data = new FormData();

  for (const [id, value] of Object.entries(snapshot.answers)) {
    const field = `question:${id}`;
    if (Array.isArray(value)) {
      for (const entry of value) data.append(field, entry);
    } else if (value !== "") {
      data.append(field, value);
    }
  }

  for (const key of snapshot.agreementKeys) {
    data.append(`agreement:${key}`, "yes");
  }

  return data;
}
