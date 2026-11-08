"use client";

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button, Text, TextField } from "@/components/ui";
import {
  isQuestionActive,
  type EventForm,
  type EventFormQuestion,
} from "@/lib/events/form-definition";
import type { RegistrationResult } from "@/lib/events/registration-result";
import { RegistrationReceipt } from "@/views/EventRegistration";

type ClientAnswer = string | string[];
type Answers = Record<string, ClientAnswer>;

type EventRegistrationFormProps = {
  definition: EventForm;
  slug: string;
  action: (
    state: RegistrationResult,
    data: FormData,
  ) => Promise<RegistrationResult>;
};

const inputClasses =
  "box-border w-full min-w-0 rounded-pill border border-solid border-muted bg-surface px-lg py-field-y font-brand text-label-m text-ink placeholder:text-ink-secondary outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";
const textareaClasses =
  "box-border w-full min-w-0 resize-y rounded-field border border-solid border-muted bg-surface px-lg py-field-y font-brand text-label-m text-ink placeholder:text-ink-secondary outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";
const summaryClasses =
  "flex w-full cursor-pointer list-none items-center justify-between gap-sm rounded-pill border border-solid border-muted bg-surface px-lg py-field-y font-brand text-label-m text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent [&::-webkit-details-marker]:hidden";

function questionKey(id: string): string {
  return `question:${id}`;
}

function agreementKey(id: string): string {
  return `agreement:${id}`;
}

function safeIdPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-");
}

function initialAnswer(question: EventFormQuestion): ClientAnswer {
  return question.kind === "multiselect" ? [] : "";
}

function clearInactiveQuestions(
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

function initialAnswers(definition: EventForm): Answers {
  const answers: Answers = {};
  for (const question of definition.questions) {
    answers[question.id] = initialAnswer(question);
  }
  return clearInactiveQuestions(definition, answers);
}

function RequiredMark() {
  return (
    <span
      aria-hidden="true"
      className="ml-1 font-brand text-body-s font-normal text-ink-secondary"
    >
      (required)
    </span>
  );
}

function FieldFeedback({
  id,
  error,
  hint,
}: {
  id: string;
  error?: string;
  hint?: string;
}) {
  const description = error ?? hint;
  if (!description) return null;

  return (
    <p
      id={id}
      role={error ? "alert" : undefined}
      className={[
        "mt-xs mb-0 font-brand text-body-s",
        error ? "text-brand-red" : "text-ink-secondary",
      ].join(" ")}
    >
      {description}
    </p>
  );
}

function FormNotice({
  tone,
  children,
  action,
}: {
  tone: "error" | "info";
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={[
        "flex flex-col gap-sm rounded-field border-l-2 border-solid bg-surface px-md py-sm text-ink sm:flex-row sm:items-center sm:justify-between",
        tone === "error" ? "border-brand-red" : "border-accent",
      ].join(" ")}
    >
      <div className="min-w-0">{children}</div>
      {action}
    </div>
  );
}

function QuestionControl({
  question,
  answer,
  error,
  controlId,
  errorId,
  onChange,
}: {
  question: EventFormQuestion;
  answer: ClientAnswer;
  error?: string;
  controlId: string;
  errorId: string;
  onChange: (value: ClientAnswer) => void;
}) {
  const required = Boolean(question.requiredWhen) || question.required;
  const field = questionKey(question.id);

  if (question.kind === "text") {
    return (
      <TextField
        id={controlId}
        name={field}
        label={required ? `${question.label} (required)` : question.label}
        required={required}
        maxLength={question.maxLength}
        value={typeof answer === "string" ? answer : ""}
        onChange={(event) => onChange(event.target.value)}
        hint={`Up to ${question.maxLength} characters.`}
        error={error}
        containerClassName="min-w-0"
      />
    );
  }

  if (question.kind === "textarea") {
    const value = typeof answer === "string" ? answer : "";
    const hint = `Up to ${question.maxLength} characters.`;

    return (
      <div className="min-w-0">
        <label
          htmlFor={controlId}
          className="mb-xs block font-brand text-label-m"
        >
          {question.label}
          {required && <RequiredMark />}
        </label>
        <textarea
          id={controlId}
          name={field}
          rows={4}
          required={required}
          maxLength={question.maxLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? errorId : undefined}
          className={textareaClasses}
        />
        <FieldFeedback id={errorId} error={error} hint={hint} />
      </div>
    );
  }

  if (question.kind === "boolean") {
    return (
      <fieldset
        className="m-0 min-w-0 border-0 p-0"
        aria-required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        tabIndex={error ? -1 : undefined}
      >
        <legend className="mb-xs p-0 font-brand text-label-m">
          {question.label}
          {required && <RequiredMark />}
        </legend>
        <div className="flex flex-wrap gap-md">
          {[
            { value: "true", label: "Yes" },
            { value: "false", label: "No" },
          ].map((option) => (
            <label
              key={option.value}
              htmlFor={`${controlId}-${option.value}`}
              className="inline-flex items-center gap-xs font-brand text-label-m"
            >
              <input
                id={`${controlId}-${option.value}`}
                type="radio"
                name={field}
                value={option.value}
                checked={answer === option.value}
                required={required}
                onChange={() => onChange(option.value)}
                aria-describedby={error ? errorId : undefined}
                className="h-4 w-4 shrink-0 accent-accent"
              />
              {option.label}
            </label>
          ))}
        </div>
        <FieldFeedback id={errorId} error={error} />
      </fieldset>
    );
  }

  if (question.kind === "select") {
    return (
      <div className="min-w-0">
        <label
          htmlFor={controlId}
          className="mb-xs block font-brand text-label-m"
        >
          {question.label}
          {required && <RequiredMark />}
        </label>
        <select
          id={controlId}
          name={field}
          required={required}
          value={typeof answer === "string" ? answer : ""}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={inputClasses}
        >
          <option value="">Select an option</option>
          {question.choices.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
        <FieldFeedback id={errorId} error={error} />
      </div>
    );
  }

  if (question.kind !== "multiselect") return null;

  const selected = Array.isArray(answer) ? answer : [];
  const choices = question.choices;
  const exclusiveValues = new Set(question.exclusiveValues ?? []);
  const selectedLabels = choices
    .filter((choice) => selected.includes(choice.value))
    .map((choice) => choice.label);

  function toggleChoice(value: string, checked: boolean) {
    let next: string[];
    if (!checked) {
      next = selected.filter((selectedValue) => selectedValue !== value);
    } else if (exclusiveValues.has(value)) {
      next = [value];
    } else {
      next = selected.filter(
        (selectedValue) =>
          selectedValue !== value && !exclusiveValues.has(selectedValue),
      );
      next.push(value);
    }

    const nextSet = new Set(next);
    onChange(
      choices
        .map((choice) => choice.value)
        .filter((choiceValue) => nextSet.has(choiceValue)),
    );
  }

  return (
    <fieldset
      className="m-0 min-w-0 border-0 p-0"
      aria-required={required}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="mb-xs p-0 font-brand text-label-m">
        {question.label}
        {required && <RequiredMark />}
      </legend>
      <details className="min-w-0">
        <summary
          id={`${controlId}-summary`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={summaryClasses}
        >
          <span className="block min-w-0 truncate">
            {selectedLabels.length > 0
              ? selectedLabels.join(", ")
              : "Select options"}
          </span>
          <span aria-hidden="true" className="shrink-0 text-ink-secondary">
            ▾
          </span>
        </summary>
        <div className="mt-xs flex flex-col gap-xs rounded-field border border-solid border-muted bg-surface p-sm">
          {choices.map((choice) => (
            <label
              key={choice.value}
              htmlFor={`${controlId}-choice-${safeIdPart(choice.value)}`}
              className="flex min-w-0 items-start gap-xs font-brand text-label-m"
            >
              <input
                id={`${controlId}-choice-${safeIdPart(choice.value)}`}
                type="checkbox"
                name={field}
                value={choice.value}
                checked={selected.includes(choice.value)}
                onChange={(event) =>
                  toggleChoice(choice.value, event.target.checked)
                }
                className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
              />
              <span className="min-w-0 break-words">{choice.label}</span>
            </label>
          ))}
        </div>
      </details>
      <FieldFeedback id={errorId} error={error} />
    </fieldset>
  );
}

export function EventRegistrationForm({
  definition,
  slug,
  action,
}: EventRegistrationFormProps) {
  const formInstanceId = useId().replace(/[^a-zA-Z0-9_-]+/g, "");
  const formRef = useRef<HTMLFormElement>(null);
  const [answers, setAnswers] = useState<Answers>(() =>
    initialAnswers(definition),
  );
  const [agreements, setAgreements] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      definition.agreements.map((agreement) => [agreement.id, false]),
    ),
  );
  const [formRevision, setFormRevision] = useState(0);
  const [state, formAction, pending] = useActionState<
    RegistrationResult,
    FormData
  >(async (previous, data) => {
    const result = await action(previous, data);
    // React resets native form fields after an action completes. Bump the
    // form key so the controlled values from state are applied again.
    setFormRevision((current) => current + 1);
    return result;
  }, { kind: "idle" });

  const registerPath = `/events/${encodeURIComponent(slug)}/register`;
  const next = encodeURIComponent(registerPath);
  const signInHref = `/sign-in?next=${next}`;
  const profileHref = `/profile/setup?next=${next}`;
  const domId = (value: string) =>
    `event-registration-${formInstanceId}-${safeIdPart(value)}`;

  // Field errors come from the shared server validator so native and server
  // validation cannot disagree. The form is controlled, so values stay put
  // when a failed submission returns these errors.
  const fieldErrors =
    state.kind === "invalid" && !pending ? state.fieldErrors : {};
  const errorFor = (field: string) => fieldErrors[field];
  const hasVisibleErrors = Object.keys(fieldErrors).length > 0;

  useEffect(() => {
    if (state.kind !== "invalid" || pending) return;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [state, pending, formRevision]);

  function updateAnswer(questionId: string, value: ClientAnswer) {
    setAnswers((current) =>
      clearInactiveQuestions(definition, {
        ...current,
        [questionId]: value,
      }),
    );
  }

  function updateAgreement(agreementId: string, checked: boolean) {
    setAgreements((current) => ({ ...current, [agreementId]: checked }));
  }

  if (state.kind === "submitted") {
    return (
      <RegistrationReceipt
        status={state.status}
        submittedAt={state.submittedAt}
      />
    );
  }

  return (
    <form
      key={formRevision}
      ref={formRef}
      action={formAction}
      noValidate
      aria-busy={pending}
      className="flex flex-col gap-lg"
    >
      {hasVisibleErrors && (
        <FormNotice tone="error">
          <Text variant="body-s">
            Check the highlighted fields and try again.
          </Text>
        </FormNotice>
      )}

      {state.kind === "sign_in_required" && (
        <FormNotice
          tone="error"
          action={
            <Button href={signInHref} variant="secondary">
              Sign in
            </Button>
          }
        >
          <Text variant="body-s">
            Your session ended before the registration was saved. Sign in to
            continue.
          </Text>
        </FormNotice>
      )}

      {state.kind === "profile_required" && (
        <FormNotice
          tone="error"
          action={
            <Button href={profileHref} variant="secondary">
              Finish profile
            </Button>
          }
        >
          <Text variant="body-s">
            Finish your profile before submitting your registration.
          </Text>
        </FormNotice>
      )}

      {state.kind === "not_open" && (
        <FormNotice tone="info">
          <Text variant="body-s">
            Registration for this event has not opened yet.
          </Text>
        </FormNotice>
      )}

      {state.kind === "closed" && (
        <FormNotice tone="info">
          <Text variant="body-s">Registration for this event is closed.</Text>
        </FormNotice>
      )}

      {state.kind === "full" && (
        <FormNotice tone="info">
          <Text variant="body-s">
            This event is full, so the registration could not be saved. Your
            answers are still here.
          </Text>
        </FormNotice>
      )}

      {state.kind === "unavailable" && (
        <FormNotice tone="info">
          <Text variant="body-s">
            Registration is unavailable for this event.
          </Text>
        </FormNotice>
      )}

      {state.kind === "retry" && (
        <FormNotice tone="error">
          <Text variant="body-s">
            We couldn&apos;t save your registration. Please review your answers
            and try again.
          </Text>
        </FormNotice>
      )}

      {definition.questions.map((question) => {
        if (!isQuestionActive(question, answers)) return null;

        const field = questionKey(question.id);
        const controlId = domId(field);

        return (
          <QuestionControl
            key={question.id}
            question={question}
            answer={
              answers[question.id] ?? initialAnswer(question)
            }
            error={errorFor(field)}
            controlId={controlId}
            errorId={`${controlId}-description`}
            onChange={(value) => updateAnswer(question.id, value)}
          />
        );
      })}

      {definition.agreements.length > 0 && (
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="mb-xs p-0 font-brand text-heading-s">
            Agreements
          </legend>
          <div className="flex flex-col gap-md">
            {definition.agreements.map((agreement) => {
              const field = agreementKey(agreement.id);
              const controlId = domId(field);
              const error = errorFor(field);
              const checked = Boolean(agreements[agreement.id]);

              return (
                <div key={agreement.id} className="min-w-0">
                  <label
                    htmlFor={controlId}
                    className="flex min-w-0 items-start gap-sm"
                  >
                    <input
                      id={controlId}
                      type="checkbox"
                      name={field}
                      value="yes"
                      checked={checked}
                      required={agreement.required}
                      onChange={(event) =>
                        updateAgreement(agreement.id, event.target.checked)
                      }
                      aria-invalid={error ? true : undefined}
                      aria-describedby={
                        error ? `${controlId}-description` : undefined
                      }
                      className="mt-0.5 h-5 w-5 shrink-0 accent-accent"
                    />
                    <span className="min-w-0">
                      <span className="block font-brand text-label-m">
                        {agreement.label}
                        {agreement.required && <RequiredMark />}
                      </span>
                      <span className="mt-xxs block break-words font-brand text-body-s text-ink-secondary">
                        {agreement.text}
                      </span>
                    </span>
                  </label>
                  <FieldFeedback
                    id={`${controlId}-description`}
                    error={error}
                  />
                </div>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="submit"
          disabled={pending}
          className="w-full sm:w-auto"
        >
          {pending
            ? "Submitting..."
            : state.kind === "retry"
              ? "Try again"
              : "Submit registration"}
        </Button>
      </div>
    </form>
  );
}
