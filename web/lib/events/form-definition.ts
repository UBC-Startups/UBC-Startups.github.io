// Shared contract for edition-specific event signup forms.

export type EventFormChoice = {
  value: string;
  label: string;
};

export type EventFormCondition = {
  questionId: string;
  includesAny: ReadonlyArray<string>;
};

export type EventFormSection = "background" | "event" | "application";

type EventFormQuestionBase = {
  id: string;
  label: string;
  required: boolean;
  requiredWhen?: EventFormCondition;
  section?: EventFormSection;
};

export type EventFormQuestion =
  | (EventFormQuestionBase & {
      kind: "text";
      maxLength: number;
    })
  | (EventFormQuestionBase & {
      kind: "textarea";
    } & (
      | { maxLength: number; maxWords?: never }
      | { maxWords: number; maxLength?: never }
    ))
  | (EventFormQuestionBase & {
      kind: "boolean";
    })
  | (EventFormQuestionBase & {
      kind: "select";
      choices: ReadonlyArray<EventFormChoice>;
    })
  | (EventFormQuestionBase & {
      kind: "multiselect";
      choices: ReadonlyArray<EventFormChoice>;
      exclusiveValues?: ReadonlyArray<string>;
    });

export type EventFormAgreement = {
  id: string;
  label: string;
  text: string;
  required: boolean;
};

export type EventForm = {
  title: string;
  /** Short invitation shown beside the event title while registration is open. */
  blurb?: string;
  questions: ReadonlyArray<EventFormQuestion>;
  agreements: ReadonlyArray<EventFormAgreement>;
};

export type AcceptedAgreement = {
  key: string;
  text: string;
  accepted_at: string;
};

export type RegistrationAnswers = Record<string, string | boolean | string[]>;

export type ValidationResult =
  | {
      ok: true;
      answers: RegistrationAnswers;
      acceptedAgreements: AcceptedAgreement[];
    }
  | {
      ok: false;
      fieldErrors: Record<string, string>;
    };

// Conditions only depend on answers that already passed validation, so the
// result is independent of field submission or definition order.
export function isQuestionActive(
  question: EventFormQuestion,
  answers: RegistrationAnswers,
): boolean {
  const condition = question.requiredWhen;
  if (!condition) return true;

  const controllingAnswer = answers[condition.questionId];
  const selected = Array.isArray(controllingAnswer)
    ? controllingAnswer
    : typeof controllingAnswer === "string"
      ? [controllingAnswer]
      : [];

  return condition.includesAny.some((value) => selected.includes(value));
}
