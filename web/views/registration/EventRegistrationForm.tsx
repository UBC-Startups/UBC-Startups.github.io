"use client";

import {
  startTransition,
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
import type { DraftAutosaveStatus } from "@/lib/events/draft-autosave";
import {
  isQuestionActive,
  type EventForm,
  type EventFormQuestion,
} from "@/lib/events/form-definition";
import type {
  RegistrationDraft,
  RegistrationDraftSaveResult,
  RegistrationResult,
} from "@/lib/events/registration-result";
import { validateRegistration } from "@/lib/events/validate-registration";
import { countWords } from "@/lib/events/word-count";
import { RegistrationDropdown } from "./RegistrationDropdown";
import { RegistrationReceipt } from "./RegistrationReceipt";
import {
  DRAFT_VALIDATION_ACCEPTED_AT,
  clearInactiveAnswers,
  initialAnswer,
  restoreAnswers,
  restoreAgreements,
  snapshotFromFormData,
  snapshotFromState,
  type Answers,
  type ClientAnswer,
} from "./registration-draft";
import { useDraftAutosave } from "./use-draft-autosave";

type EventRegistrationFormProps = {
  definition: EventForm;
  slug: string;
  initialDraft?: RegistrationDraft;
  action: (
    state: RegistrationResult,
    data: FormData,
  ) => Promise<RegistrationResult>;
  saveDraftAction: (
    expectedRevision: number,
    data: FormData,
  ) => Promise<RegistrationDraftSaveResult>;
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
    DRAFT_VALIDATION_ACCEPTED_AT,
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

function stepIsComplete(
  definition: EventForm,
  stepId: RegistrationStepId,
  answers: Answers,
  agreements: Record<string, boolean>,
): boolean {
  return (
    Object.keys(validateStep(definition, stepId, answers, agreements)).length ===
    0
  );
}

function buildInitialFormState(
  definition: EventForm,
  steps: ReadonlyArray<RegistrationStep>,
  draft: RegistrationDraft | undefined,
): {
  answers: Answers;
  agreements: Record<string, boolean>;
  currentStep: RegistrationStepId;
} {
  const answers = restoreAnswers(definition, draft);
  const agreements = restoreAgreements(definition, draft);

  // A brand-new application always starts on the first step, even when that
  // step is optional. Only an existing saved draft resumes at the first step
  // that still needs work.
  if (!draft) {
    return { answers, agreements, currentStep: steps[0].id };
  }

  // Resume the first step that still needs work without surfacing field errors
  // until the attendee actually tries to advance. If every step is valid,
  // resume on the final step so submission is one action away.
  const firstIncomplete = steps.find(
    (step) => !stepIsComplete(definition, step.id, answers, agreements),
  );
  const currentStep = firstIncomplete?.id ?? steps[steps.length - 1].id;

  return { answers, agreements, currentStep };
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

const compactActionClass = "min-h-8 px-sm py-xs text-label-s";

function AutosaveFeedback({
  status,
  signInHref,
  profileHref,
  onRetry,
}: {
  status: DraftAutosaveStatus;
  signInHref: string;
  profileHref: string;
  onRetry: () => void;
}) {
  if (status.kind === "idle") {
    // Keep a stable slot so the first keystroke does not shift the form.
    return <div aria-hidden="true" className="min-h-5" />;
  }

  let message = "";
  let action: ReactNode;

  switch (status.kind) {
    case "saving":
      message = "Saving progress…";
      break;
    case "saved":
      message = "Progress saved";
      break;
    case "retry":
      message = "Couldn’t save your progress";
      action = (
        <Button
          type="button"
          variant="secondary"
          className={compactActionClass}
          onClick={onRetry}
        >
          Retry
        </Button>
      );
      break;
    case "conflict":
      message =
        "Your saved progress changed in another tab. Reload to get the latest version.";
      action = (
        <Button
          type="button"
          variant="secondary"
          className={compactActionClass}
          onClick={() => window.location.reload()}
        >
          Reload
        </Button>
      );
      break;
    case "blocked":
      switch (status.reason) {
        case "sign_in_required":
          message =
            "Your session ended, so progress couldn’t be saved. Sign in to keep working.";
          action = (
            <Button
              href={signInHref}
              variant="secondary"
              className={compactActionClass}
            >
              Sign in
            </Button>
          );
          break;
        case "profile_required":
          message = "Finish your profile to keep saving progress.";
          action = (
            <Button
              href={profileHref}
              variant="secondary"
              className={compactActionClass}
            >
              Finish profile
            </Button>
          );
          break;
        case "not_open":
          message =
            "Registration hasn’t opened yet, so progress couldn’t be saved.";
          break;
        case "closed":
          message = "Registration is closed, so progress couldn’t be saved.";
          break;
        case "unavailable":
          message = "Progress saving is unavailable right now.";
          break;
        case "invalid":
          message =
            "Some answers couldn’t be saved. Review them and try again.";
          break;
      }
      break;
  }

  const polite = status.kind === "saving" || status.kind === "saved";
  const isError =
    status.kind === "retry" ||
    status.kind === "conflict" ||
    status.kind === "blocked";

  return (
    <div
      role={polite ? "status" : "alert"}
      className="flex min-h-5 min-w-0 flex-col gap-xs sm:flex-row sm:items-center sm:justify-between"
    >
      <Text
        variant="body-s"
        className={`m-0 ${isError ? "text-brand-red" : "text-ink-secondary"}`}
      >
        {message}
      </Text>
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
        disabled={disabled}
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
          disabled={disabled}
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
                disabled={disabled}
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
        disabled={disabled}
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
  initialDraft,
  action,
  saveDraftAction,
}: EventRegistrationFormProps) {
  const formInstanceId = useId().replace(/[^a-zA-Z0-9_-]+/g, "");
  const formRef = useRef<HTMLFormElement>(null);
  const steps = useMemo(() => getRegistrationSteps(definition), [definition]);
  const [initialState] = useState(() =>
    buildInitialFormState(definition, steps, initialDraft),
  );
  const [answers, setAnswers] = useState<Answers>(initialState.answers);
  const [agreements, setAgreements] = useState<Record<string, boolean>>(
    initialState.agreements,
  );
  const [currentStep, setCurrentStep] = useState<RegistrationStepId>(
    initialState.currentStep,
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [focusRequest, setFocusRequest] = useState(0);
  const [formRevision, setFormRevision] = useState(0);
  const [finalSubmitting, setFinalSubmitting] = useState(false);
  const finalSubmitRef = useRef(false);
  const finalActionResolveRef = useRef<
    ((result: RegistrationResult) => void) | null
  >(null);
  const [state, formAction, actionPending] = useActionState<
    RegistrationResult,
    FormData
  >(async (previous, data) => {
    let result: RegistrationResult = { kind: "retry" };

    try {
      try {
        result = await action(previous, data);
      } catch {
        // An unexpected request failure must stay inside the form: keep the
        // answers and draft, and surface the existing retry result.
        result = { kind: "retry" };
      }

      // React resets native form fields after an action completes. Bump the
      // form key so the controlled values from state are applied again.
      setFormRevision((current) => current + 1);

      // Server validation remains authoritative. Select the first affected
      // panel before focusing its first invalid control, even when that
      // control was hidden on an earlier step.
      if (result.kind === "invalid") {
        setFieldErrors(result.fieldErrors);
        setCurrentStep(firstErrorStep(result.fieldErrors, definition, steps));
        setFocusRequest((current) => current + 1);
      }

      return result;
    } finally {
      // Let the submit handler release the frozen form once the whole action
      // settles, including after an unexpected failure.
      finalActionResolveRef.current?.(result);
    }
  }, { kind: "idle" });

  const {
    status: autosaveStatus,
    queueDraft,
    retry: retryDraftSave,
    flush: flushDraftSave,
    stop: stopDraftSave,
  } = useDraftAutosave({
    initialRevision: initialDraft?.revision ?? 0,
    initialSnapshot: snapshotFromState(
      definition,
      initialState.answers,
      initialState.agreements,
    ),
    initialSavedAt: initialDraft?.updatedAt ?? null,
    saveDraftAction,
  });

  // Pills reflect the current answers rather than only past navigation, so a
  // resumed draft and later edits always show which steps are truly complete.
  const completedSteps = useMemo(() => {
    const completed = new Set<RegistrationStepId>();
    for (const step of steps) {
      if (stepIsComplete(definition, step.id, answers, agreements)) {
        completed.add(step.id);
      }
    }
    return completed;
  }, [definition, steps, answers, agreements]);

  const finalPending = finalSubmitting || actionPending;

  useEffect(() => {
    if (state.kind === "submitted") stopDraftSave();
  }, [state.kind, stopDraftSave]);

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

  function updateAnswer(questionId: string, value: ClientAnswer) {
    const nextAnswers = clearInactiveAnswers(definition, {
      ...answers,
      [questionId]: value,
    });
    setAnswers(nextAnswers);
    queueDraft(snapshotFromState(definition, nextAnswers, agreements));

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
  }

  function updateAgreement(agreementId: string, checked: boolean) {
    const nextAgreements = { ...agreements, [agreementId]: checked };
    setAgreements(nextAgreements);
    queueDraft(snapshotFromState(definition, answers, nextAgreements));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[agreementKey(agreementId)];
      return next;
    });
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

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    // A native implicit or requestSubmit submission on an earlier step must
    // validate and advance instead of running the server action.
    if (!isFinalStep) {
      event.preventDefault();
      tryAdvance(currentStepIndex + 1);
      return;
    }

    event.preventDefault();
    if (finalSubmitRef.current || finalPending) return;

    // Capture the native values before any await or disabled state can alter
    // the form, then flush exactly this snapshot before strict submission.
    const captured = new FormData(event.currentTarget);
    const snapshot = snapshotFromFormData(definition, captured);

    finalSubmitRef.current = true;
    setFinalSubmitting(true);

    let submitted = false;
    try {
      const saved = await flushDraftSave(snapshot);
      if (saved.kind !== "saved") return;

      captured.set("draft_revision", String(saved.revision));

      // Server Actions invoked outside a form action must run in a transition.
      // Keep the captured FormData and wait for the action wrapper to settle so
      // the controls stay frozen through the whole request, not just the flush.
      const result = await new Promise<RegistrationResult>((resolve) => {
        finalActionResolveRef.current = resolve;
        startTransition(() => {
          formAction(captured);
        });
      });
      submitted = result.kind === "submitted";
    } catch {
      // The action wrapper maps request failures to the retry result. A
      // synchronous dispatch failure still releases the controls below.
    } finally {
      finalActionResolveRef.current = null;

      // A completed submission immediately renders the receipt. Every other
      // outcome must release the frozen controls so the attendee can retry.
      if (!submitted) {
        finalSubmitRef.current = false;
        setFinalSubmitting(false);
      }
    }
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

  if (autosaveStatus.kind === "submitted") {
    return (
      <RegistrationReceipt
        status={autosaveStatus.status}
        submittedAt={autosaveStatus.submittedAt}
      />
    );
  }

  return (
    <form
      key={formRevision}
      ref={formRef}
      noValidate
      aria-busy={finalPending}
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

      {state.kind === "conflict" && (
        <FormNotice
          tone="error"
          action={
            <Button
              type="button"
              variant="secondary"
              className={compactActionClass}
              onClick={() => window.location.reload()}
            >
              Reload
            </Button>
          }
        >
          <Text variant="body-s">
            Your saved progress changed in another tab. Reload before submitting
            so no answer is lost.
          </Text>
        </FormNotice>
      )}

      <AutosaveFeedback
        status={autosaveStatus}
        signInHref={signInHref}
        profileHref={profileHref}
        onRetry={retryDraftSave}
      />

      <Text variant="body-s" className="m-0 text-ink-secondary">
        Saved progress is not a submitted application.
      </Text>

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
                  disabled={finalPending}
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
                      disabled={finalPending}
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
                                disabled={finalPending}
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
              disabled={finalPending}
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
              disabled={finalPending}
              onClick={() => tryAdvance(currentStepIndex + 1)}
              className="min-h-12 w-full sm:w-auto sm:min-w-[150px]"
            >
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={finalPending}
              className="min-h-12 w-full sm:w-auto sm:min-w-[190px]"
            >
              {finalPending
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
