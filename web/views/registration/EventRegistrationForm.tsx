"use client";

import {
  useActionState,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Button, Heading, Text, TextField } from "@/components/ui";
import {
  isQuestionActive,
  type EventForm,
  type EventFormQuestion,
} from "@/lib/events/form-definition";
import type { RegistrationResult } from "@/lib/events/registration-result";
import { validateRegistration } from "@/lib/events/validate-registration";
import { countWords } from "@/lib/events/word-count";
import { RegistrationDropdown } from "./RegistrationDropdown";
import { RegistrationReceipt } from "./RegistrationReceipt";

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

type RegistrationStepId =
  | "background"
  | "event"
  | "application"
  | "agreements";

type RegistrationStep = {
  id: RegistrationStepId;
  label: string;
};

const panelHeadings: Record<RegistrationStepId, string> = {
  background: "Your background",
  event: "Event details",
  application: "Application questions",
  agreements: "Agreements",
};

const textareaClasses =
  "box-border w-full min-w-0 resize-y rounded-field border border-solid border-muted bg-surface px-lg py-field-y font-brand text-label-m text-ink placeholder:text-ink-secondary outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

function questionKey(id: string): string {
  return `question:${id}`;
}

function agreementKey(id: string): string {
  return `agreement:${id}`;
}

function safeIdPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-");
}

function sectionOf(question: EventFormQuestion): RegistrationStepId {
  return question.section ?? "background";
}

function initialAnswer(question: EventFormQuestion): ClientAnswer {
  return question.kind === "multiselect" ? [] : "";
}

function getRegistrationSteps(definition: EventForm): RegistrationStep[] {
  const steps: RegistrationStep[] = [
    { id: "background", label: "Background" },
  ];

  if (definition.questions.some((question) => sectionOf(question) === "event")) {
    steps.push({ id: "event", label: "Event details" });
  }
  if (definition.questions.some((question) => sectionOf(question) === "application")) {
    steps.push({ id: "application", label: "Application questions" });
  }
  if (definition.agreements.length > 0) {
    steps.push({ id: "agreements", label: "Agreements" });
  }

  return steps;
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

function scopedDefinition(
  definition: EventForm,
  stepId: RegistrationStepId,
): EventForm {
  return {
    title: definition.title,
    questions: definition.questions.filter(
      (question) => sectionOf(question) === stepId,
    ),
    agreements:
      stepId === "agreements" ? definition.agreements : [],
  };
}

function scopedFormData(
  definition: EventForm,
  stepId: RegistrationStepId,
  answers: Answers,
  agreements: Record<string, boolean>,
): FormData {
  const data = new FormData();

  for (const question of definition.questions) {
    if (sectionOf(question) !== stepId) continue;
    if (!isQuestionActive(question, answers)) continue;

    const value = answers[question.id];
    if (Array.isArray(value)) {
      for (const entry of value) {
        data.append(questionKey(question.id), entry);
      }
    } else if (typeof value === "string" && value !== "") {
      data.append(questionKey(question.id), value);
    }
  }

  if (stepId === "agreements") {
    for (const agreement of definition.agreements) {
      if (agreements[agreement.id]) {
        data.append(agreementKey(agreement.id), "yes");
      }
    }
  }

  return data;
}

function validateStep(
  definition: EventForm,
  stepId: RegistrationStepId,
  answers: Answers,
  agreements: Record<string, boolean>,
): Record<string, string> {
  const result = validateRegistration(
    scopedDefinition(definition, stepId),
    scopedFormData(definition, stepId, answers, agreements),
    new Date().toISOString(),
  );

  return result.ok ? {} : result.fieldErrors;
}

function stepForField(
  field: string,
  definition: EventForm,
): RegistrationStepId {
  if (field.startsWith("question:")) {
    const id = field.slice("question:".length);
    const question = definition.questions.find((entry) => entry.id === id);
    return question ? sectionOf(question) : "background";
  }

  return "agreements";
}

function firstErrorStep(
  fieldErrors: Record<string, string>,
  definition: EventForm,
  steps: ReadonlyArray<RegistrationStep>,
): RegistrationStepId {
  for (const step of steps) {
    if (
      Object.keys(fieldErrors).some(
        (field) => stepForField(field, definition) === step.id,
      )
    ) {
      return step.id;
    }
  }

  return steps[0]?.id ?? "background";
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
  disabled,
  placeholder,
  onChange,
}: {
  question: EventFormQuestion;
  answer: ClientAnswer;
  error?: string;
  controlId: string;
  errorId: string;
  disabled: boolean;
  placeholder: string;
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
        className="min-h-12"
        containerClassName="min-w-0"
      />
    );
  }

  if (question.kind === "textarea") {
    const value = typeof answer === "string" ? answer : "";
    const wordLimited =
      "maxWords" in question && question.maxWords !== undefined;
    const hint = wordLimited
      ? undefined
      : `Up to ${question.maxLength} characters.`;
    const wordCount = wordLimited ? countWords(value) : 0;
    const counterId = `${errorId}-counter`;
    const overWordLimit =
      wordLimited && question.maxWords !== undefined
        ? wordCount > question.maxWords
        : false;
    const describedBy = [
      wordLimited ? counterId : undefined,
      error || (!wordLimited && hint) ? errorId : undefined,
    ]
      .filter(Boolean)
      .join(" ");

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
          maxLength={wordLimited ? undefined : question.maxLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error || overWordLimit ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={[
            textareaClasses,
            error || overWordLimit ? "border-brand-red" : null,
          ]
            .filter(Boolean)
            .join(" ")}
        />
        {wordLimited ? (
          <div className="mt-xs flex flex-wrap items-baseline justify-between gap-x-sm gap-y-xxs">
            <FieldFeedback id={errorId} error={error} />
            <p
              id={counterId}
              className={[
                "mb-0 font-brand text-body-s",
                overWordLimit ? "text-brand-red" : "text-ink-secondary",
              ].join(" ")}
            >
              {wordCount} / {question.maxWords} words
            </p>
          </div>
        ) : (
          <FieldFeedback id={errorId} error={error} hint={hint} />
        )}
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
        <RegistrationDropdown
          id={controlId}
          label={question.label}
          fieldName={field}
          mode="single"
          choices={question.choices}
          value={typeof answer === "string" ? answer : ""}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          error={error}
          errorId={errorId}
          onChange={(next) => {
            if (typeof next === "string") onChange(next);
          }}
        />
        <FieldFeedback id={errorId} error={error} />
      </div>
    );
  }

  if (question.kind !== "multiselect") return null;

  return (
    <div className="min-w-0">
      <RegistrationDropdown
        id={controlId}
        label={question.label}
        fieldName={field}
        mode="multi"
        choices={question.choices}
        value={Array.isArray(answer) ? answer : []}
        placeholder="Select options"
        required={required}
        error={error}
        errorId={errorId}
        exclusiveValues={question.exclusiveValues}
        onChange={(next) => {
          if (Array.isArray(next)) onChange(next);
        }}
      />
      <FieldFeedback id={errorId} error={error} />
    </div>
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
  const steps = useMemo(() => getRegistrationSteps(definition), [definition]);
  const [currentStep, setCurrentStep] = useState<RegistrationStepId>(
    steps[0].id,
  );
  const [completedSteps, setCompletedSteps] = useState<Set<RegistrationStepId>>(
    () => new Set(),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [focusRequest, setFocusRequest] = useState(0);
  const [formRevision, setFormRevision] = useState(0);
  const [state, formAction, pending] = useActionState<
    RegistrationResult,
    FormData
  >(async (previous, data) => {
    const result = await action(previous, data);
    // React resets native form fields after an action completes. Bump the
    // form key so the controlled values from state are applied again.
    setFormRevision((current) => current + 1);

    // Server validation remains authoritative. Select the first affected
    // panel before focusing its first invalid control, even when that control
    // was hidden on an earlier step.
    if (result.kind === "invalid") {
      setFieldErrors(result.fieldErrors);
      setCurrentStep(firstErrorStep(result.fieldErrors, definition, steps));
      setFocusRequest((current) => current + 1);
    }

    return result;
  }, { kind: "idle" });

  const registerPath = `/events/${encodeURIComponent(slug)}/register`;
  const next = encodeURIComponent(registerPath);
  const signInHref = `/sign-in?next=${next}`;
  const profileHref = `/profile/setup?next=${next}`;
  const domId = (value: string) =>
    `event-registration-${formInstanceId}-${safeIdPart(value)}`;
  const panelId = (stepId: RegistrationStepId) => domId(`step-${stepId}`);
  const tabId = (stepId: RegistrationStepId) => domId(`tab-${stepId}`);
  const currentStepIndex = Math.max(
    steps.findIndex((step) => step.id === currentStep),
    0,
  );
  const isFinalStep = currentStepIndex === steps.length - 1;

  useEffect(() => {
    if (focusRequest === 0) return;
    const panel = document.getElementById(
      `event-registration-${formInstanceId}-step-${currentStep}`,
    );
    panel
      ?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')
      ?.focus();
  }, [focusRequest, currentStep, formInstanceId]);

  function invalidateCompletedFrom(stepId: RegistrationStepId) {
    const index = steps.findIndex((step) => step.id === stepId);
    if (index < 0) return;

    setCompletedSteps((current) => {
      const next = new Set(current);
      for (let offset = index; offset < steps.length; offset += 1) {
        next.delete(steps[offset].id);
      }
      return next;
    });
  }

  function updateAnswer(questionId: string, value: ClientAnswer) {
    const nextAnswers = clearInactiveQuestions(definition, {
      ...answers,
      [questionId]: value,
    });
    setAnswers(nextAnswers);

    const question = definition.questions.find(
      (entry) => entry.id === questionId,
    );
    const wordLimited =
      question?.kind === "textarea" &&
      "maxWords" in question &&
      question.maxWords !== undefined;
    const wordCount =
      wordLimited && typeof value === "string" ? countWords(value) : 0;
    const overWordLimit =
      wordLimited &&
      question?.kind === "textarea" &&
      "maxWords" in question &&
      question.maxWords !== undefined &&
      wordCount > question.maxWords;

    setFieldErrors((current) => {
      const nextErrors = { ...current };

      // Editing clears stale errors for this field and for conditional fields
      // that became inactive.
      for (const key of Object.keys(nextErrors)) {
        if (!key.startsWith("question:")) continue;
        const id = key.slice("question:".length);
        if (!Object.prototype.hasOwnProperty.call(nextAnswers, id)) {
          delete nextErrors[key];
        }
      }
      delete nextErrors[questionKey(questionId)];

      if (overWordLimit && question?.kind === "textarea" && "maxWords" in question) {
        nextErrors[questionKey(questionId)] =
          `Use ${question.maxWords} words or fewer.`;
      }

      return nextErrors;
    });

    invalidateCompletedFrom(
      question ? sectionOf(question) : "background",
    );
  }

  function updateAgreement(agreementId: string, checked: boolean) {
    setAgreements((current) => ({ ...current, [agreementId]: checked }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[agreementKey(agreementId)];
      return next;
    });
    invalidateCompletedFrom("agreements");
  }

  function tryAdvance(targetIndex: number): boolean {
    if (targetIndex < 0 || targetIndex >= steps.length) return false;

    const errors: Record<string, string> = {};
    let firstStep: RegistrationStepId | null = null;

    // Forward navigation validates every step it would pass, so a later step
    // can never be reached over an invalid required answer.
    for (let index = 0; index < targetIndex; index += 1) {
      const stepErrors = validateStep(
        definition,
        steps[index].id,
        answers,
        agreements,
      );
      if (Object.keys(stepErrors).length === 0) continue;
      if (!firstStep) firstStep = steps[index].id;
      Object.assign(errors, stepErrors);
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      if (firstStep) setCurrentStep(firstStep);
      setFocusRequest((current) => current + 1);
      return false;
    }

    setFieldErrors((current) => {
      const nextErrors = { ...current };
      for (const key of Object.keys(nextErrors)) {
        const fieldStep = stepForField(key, definition);
        const fieldIndex = steps.findIndex((step) => step.id === fieldStep);
        if (fieldIndex >= 0 && fieldIndex < targetIndex) {
          delete nextErrors[key];
        }
      }
      return nextErrors;
    });
    setCompletedSteps((current) => {
      const nextCompleted = new Set(current);
      for (let index = 0; index < targetIndex; index += 1) {
        nextCompleted.add(steps[index].id);
      }
      return nextCompleted;
    });
    setCurrentStep(steps[targetIndex].id);
    return true;
  }

  function handleFormKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    // Nested widgets such as the registration dropdown consume Enter before
    // it reaches the form; do not advance again from their key handling.
    if (event.defaultPrevented) return;
    if (event.key !== "Enter" || event.shiftKey || isFinalStep) return;

    const target = event.target as HTMLElement;
    if (
      target.tagName === "TEXTAREA" ||
      target.tagName === "BUTTON" ||
      target.isContentEditable
    ) {
      return;
    }

    event.preventDefault();
    tryAdvance(currentStepIndex + 1);
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    // A native implicit or requestSubmit submission on an earlier step must
    // validate and advance instead of running the server action.
    if (isFinalStep) return;

    event.preventDefault();
    tryAdvance(currentStepIndex + 1);
  }

  const errorFor = (field: string) => fieldErrors[field];

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
      onKeyDown={handleFormKeyDown}
      onSubmit={handleFormSubmit}
      className="flex min-h-0 flex-col gap-lg lg:flex-1 lg:gap-md"
    >
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

      <nav aria-label="Registration steps" className="min-w-0 shrink-0">
        <ol className="m-0 grid list-none auto-cols-fr grid-flow-col gap-xs p-0">
          {steps.map((step, index) => {
            const isCurrent = step.id === currentStep;
            const isCompleted = completedSteps.has(step.id) && !isCurrent;

            return (
              <li key={step.id} className="flex min-w-0">
                <button
                  type="button"
                  id={tabId(step.id)}
                  onClick={() => tryAdvance(index)}
                  disabled={pending}
                  aria-label={step.label}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-controls={panelId(step.id)}
                  title={step.label}
                  className="group box-border flex min-h-6 w-full min-w-0 items-center rounded-pill border-0 bg-transparent p-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span
                    aria-hidden="true"
                    className={[
                      "block h-1.5 w-full rounded-pill transition-colors",
                      isCurrent
                        ? "bg-inverse"
                        : isCompleted
                          ? "bg-brand-green"
                          : "bg-muted",
                    ].join(" ")}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {steps.map((step) => {
        const hidden = step.id !== currentStep;

        return (
          <section
            key={step.id}
            id={panelId(step.id)}
            aria-labelledby={tabId(step.id)}
            hidden={hidden}
            className={[
              "min-h-0",
              hidden ? null : "lg:flex lg:flex-1 lg:flex-col",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div
              data-registration-scroll="true"
              className="flex flex-col gap-lg lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:p-xs"
            >
              <Heading as="h3" variant="heading-m" className="m-0">
                {panelHeadings[step.id]}
              </Heading>

              {definition.questions
                .filter((question) => sectionOf(question) === step.id)
                .map((question) => {
                  if (!isQuestionActive(question, answers)) return null;

                  const field = questionKey(question.id);
                  const controlId = domId(field);
                  const placeholder =
                    question.kind === "select"
                      ? "Select an option"
                      : "Select options";

                  return (
                    <QuestionControl
                      key={question.id}
                      question={question}
                      answer={answers[question.id] ?? initialAnswer(question)}
                      error={errorFor(field)}
                      controlId={controlId}
                      errorId={`${controlId}-description`}
                      disabled={pending}
                      placeholder={placeholder}
                      onChange={(value) => updateAnswer(question.id, value)}
                    />
                  );
                })}

              {step.id === "agreements" &&
                definition.agreements.length > 0 && (
                  <fieldset className="m-0 min-w-0 border-0 p-0">
                    <legend className="sr-only p-0">Agreements</legend>
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
                                  updateAgreement(
                                    agreement.id,
                                    event.target.checked,
                                  )
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
            </div>
          </section>
        );
      })}

      <div className="flex shrink-0 flex-col gap-sm border-x-0 border-b-0 border-t border-solid border-muted pt-md">
        {isFinalStep && (
          <Text variant="body-s" className="text-ink-secondary">
            You won’t be able to change your answers after you submit.
          </Text>
        )}

        <div className="flex min-w-0 flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
          {currentStepIndex > 0 ? (
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={() => setCurrentStep(steps[currentStepIndex - 1].id)}
              className="min-h-12 w-full sm:w-auto"
            >
              Back
            </Button>
          ) : (
            <span aria-hidden="true" className="hidden sm:block" />
          )}

          {!isFinalStep ? (
            <Button
              type="button"
              disabled={pending}
              onClick={() => tryAdvance(currentStepIndex + 1)}
              className="min-h-12 w-full sm:w-auto sm:min-w-[150px]"
            >
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={pending}
              className="min-h-12 w-full sm:w-auto sm:min-w-[190px]"
            >
              {pending
                ? "Submitting..."
                : state.kind === "retry"
                  ? "Try again"
                  : "Submit registration"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
