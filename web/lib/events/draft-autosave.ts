// Serializes pre-submission draft snapshots with debounce and revision CAS.
//
// The coordinator owns no React state and performs no I/O itself. The caller
// injects the save function, timers, and a status callback so the debounce,
// coalescing, retry, conflict, and flush behavior can be tested deterministically.

import type {
  RegistrationDraftSaveResult,
  RegistrationDraftSnapshot,
  SubmittedRegistrationStatus,
} from "./registration-result";

export type DraftAutosaveTimerHandle = unknown;

export type DraftAutosaveTimers = {
  setTimeout: (
    callback: () => void,
    delayMs: number,
  ) => DraftAutosaveTimerHandle;
  clearTimeout: (handle: DraftAutosaveTimerHandle) => void;
};

export type DraftAutosaveSave = (
  snapshot: RegistrationDraftSnapshot,
  expectedRevision: number,
) => Promise<RegistrationDraftSaveResult>;

export type DraftAutosaveBlockedReason =
  | "sign_in_required"
  | "profile_required"
  | "not_open"
  | "closed"
  | "unavailable"
  | "invalid";

export type DraftAutosaveStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; revision: number; savedAt: string }
  | { kind: "retry" }
  | { kind: "conflict" }
  | {
      kind: "submitted";
      status: SubmittedRegistrationStatus;
      submittedAt: string;
    }
  | { kind: "blocked"; reason: DraftAutosaveBlockedReason };

export const DRAFT_AUTOSAVE_DEBOUNCE_MS = 1000;

const EMPTY_SNAPSHOT: RegistrationDraftSnapshot = {
  answers: {},
  agreementKeys: [],
};

const defaultTimers: DraftAutosaveTimers = {
  setTimeout: (callback, delayMs) => setTimeout(callback, delayMs),
  clearTimeout: (handle) =>
    clearTimeout(handle as ReturnType<typeof setTimeout>),
};

function cloneSnapshot(
  snapshot: RegistrationDraftSnapshot,
): RegistrationDraftSnapshot {
  const answers: RegistrationDraftSnapshot["answers"] = {};
  for (const [key, value] of Object.entries(snapshot.answers)) {
    answers[key] = Array.isArray(value) ? [...value] : value;
  }
  return { answers, agreementKeys: [...snapshot.agreementKeys] };
}

/**
 * A deterministic key for "same working snapshot". Answer keys and agreement
 * keys are order-independent; multiselect answer order is significant because
 * it follows the fixed definition order in the UI.
 */
export function canonicalDraftSnapshot(
  snapshot: RegistrationDraftSnapshot,
): string {
  const answers = Object.keys(snapshot.answers)
    .sort()
    .map((key) => [key, snapshot.answers[key]]);
  return JSON.stringify({
    answers,
    agreementKeys: [...snapshot.agreementKeys].sort(),
  });
}

function blockedReason(
  result: RegistrationDraftSaveResult,
): DraftAutosaveBlockedReason | null {
  switch (result.kind) {
    case "sign_in_required":
      return "sign_in_required";
    case "profile_required":
      return "profile_required";
    case "not_open":
      return "not_open";
    case "closed":
      return "closed";
    case "unavailable":
      return "unavailable";
    case "invalid":
      return "invalid";
    default:
      return null;
  }
}

export type DraftAutosaveOptions = {
  save: DraftAutosaveSave;
  initialRevision: number;
  initialSnapshot?: RegistrationDraftSnapshot;
  initialSavedAt?: string | null;
  debounceMs?: number;
  timers?: DraftAutosaveTimers;
  onStatus?: (status: DraftAutosaveStatus) => void;
};

export class DraftAutosaveCoordinator {
  private readonly save: DraftAutosaveSave;
  private readonly timers: DraftAutosaveTimers;
  private readonly debounceMs: number;
  private readonly onStatus?: (status: DraftAutosaveStatus) => void;

  private revision: number;
  private baselineKey: string;
  private latest: RegistrationDraftSnapshot | null;
  private latestKey: string | null;
  private lastSavedAt: string | null;

  private timer: DraftAutosaveTimerHandle | null = null;
  private queued: RegistrationDraftSnapshot | null = null;
  private inflight: Promise<RegistrationDraftSaveResult> | null = null;
  private stopped = false;
  private hardStop: "conflict" | "submitted" | null = null;
  private terminal: {
    status: SubmittedRegistrationStatus;
    submittedAt: string;
  } | null = null;

  constructor(options: DraftAutosaveOptions) {
    this.save = options.save;
    this.timers = options.timers ?? defaultTimers;
    this.debounceMs = options.debounceMs ?? DRAFT_AUTOSAVE_DEBOUNCE_MS;
    this.onStatus = options.onStatus;
    this.revision = options.initialRevision;
    this.latest = options.initialSnapshot
      ? cloneSnapshot(options.initialSnapshot)
      : cloneSnapshot(EMPTY_SNAPSHOT);
    this.latestKey = canonicalDraftSnapshot(this.latest);
    this.baselineKey = this.latestKey;
    this.lastSavedAt = options.initialSavedAt ?? null;
  }

  /** True when leaving would lose an unsaved edit or an in-flight save. */
  hasPendingWork(): boolean {
    if (this.stopped) return false;
    if (this.hardStop === "submitted") return false;
    if (this.hardStop === "conflict") return true;
    return (
      this.timer !== null ||
      this.inflight !== null ||
      this.queued !== null ||
      (this.latestKey !== null && this.latestKey !== this.baselineKey)
    );
  }

  /**
   * Record a changed snapshot. The first request waits for the debounce
   * interval; repeated edits reset it. Edits during an in-flight save only
   * replace the one coalesced next snapshot.
   */
  enqueue(snapshot: RegistrationDraftSnapshot): void {
    if (this.stopped || this.hardStop) return;

    const key = canonicalDraftSnapshot(snapshot);
    if (key === this.latestKey) return;

    this.latest = cloneSnapshot(snapshot);
    this.latestKey = key;

    if (key === this.baselineKey) {
      // The user returned to the exact persisted snapshot before it was sent.
      this.cancelTimer();
      this.queued = null;
      if (this.inflight === null) this.emitPersistedOrIdle();
      return;
    }

    this.emit({ kind: "saving" });

    if (this.inflight !== null) {
      this.queued = cloneSnapshot(snapshot);
      return;
    }

    this.schedule();
  }

  /** Explicit user retry after a failed automatic save. */
  retry(): Promise<RegistrationDraftSaveResult> | null {
    if (this.stopped) return null;
    if (this.hardStop === "conflict") return null;
    if (this.hardStop === "submitted") {
      return this.terminal ? Promise.resolve(this.terminalResult()) : null;
    }
    if (this.inflight !== null) return this.inflight;
    if (this.latest === null) return null;

    this.cancelTimer();
    this.queued = null;
    this.emit({ kind: "saving" });
    return this.request(this.latest);
  }

  /**
   * Cancel the debounce and persist the supplied snapshot before a strict
   * final submission. A previous in-flight save is awaited first so the final
   * request carries the revision it produced. If that save already persisted
   * this exact snapshot, no redundant request is made.
   */
  async flush(
    snapshot: RegistrationDraftSnapshot,
  ): Promise<RegistrationDraftSaveResult> {
    if (this.stopped) return { kind: "retry" };
    if (this.hardStop === "conflict") return { kind: "conflict" };
    if (this.hardStop === "submitted") return this.terminalResult();

    this.cancelTimer();
    this.queued = null;
    this.latest = cloneSnapshot(snapshot);
    this.latestKey = canonicalDraftSnapshot(snapshot);

    // Always settle the in-flight save first. Even when the captured snapshot
    // matches the current baseline, that save may still advance the revision.
    const previous = this.inflight;
    if (previous !== null) {
      const previousResult = await previous;
      if (this.stopped) return previousResult;
      if (
        previousResult.kind === "conflict" ||
        previousResult.kind === "submitted"
      ) {
        return previousResult;
      }
    }

    this.cancelTimer();
    this.queued = null;
    this.latest = cloneSnapshot(snapshot);
    this.latestKey = canonicalDraftSnapshot(snapshot);

    if (this.latestKey === this.baselineKey) return this.persistedResult();
    if (this.hardStop === "conflict") return { kind: "conflict" };
    if (this.hardStop === "submitted") return this.terminalResult();

    this.emit({ kind: "saving" });
    return this.request(snapshot);
  }

  /**
   * Stop queueing and ignore any late response. Used after a terminal final
   * submission or when the form unmounts.
   */
  stop(): void {
    this.stopped = true;
    this.cancelTimer();
    this.queued = null;
  }

  private schedule(): void {
    this.cancelTimer();
    this.timer = this.timers.setTimeout(() => {
      this.timer = null;
      if (this.stopped || this.hardStop) return;
      if (this.latest === null) return;
      void this.request(this.latest);
    }, this.debounceMs);
  }

  private request(
    snapshot: RegistrationDraftSnapshot,
  ): Promise<RegistrationDraftSaveResult> {
    const expectedRevision = this.revision;
    const requestSnapshot = cloneSnapshot(snapshot);

    const run = (async (): Promise<RegistrationDraftSaveResult> => {
      let result: RegistrationDraftSaveResult;
      try {
        result = await this.save(requestSnapshot, expectedRevision);
      } catch {
        result = { kind: "retry" };
      }

      // Do not publish or schedule work from a stopped/unmounted coordinator.
      if (this.stopped) return result;

      this.inflight = null;
      this.applyResult(requestSnapshot, result);
      return result;
    })();

    this.inflight = run;
    return run;
  }

  private applyResult(
    snapshot: RegistrationDraftSnapshot,
    result: RegistrationDraftSaveResult,
  ): void {
    switch (result.kind) {
      case "saved":
        this.revision = result.revision;
        this.lastSavedAt = result.savedAt;
        this.baselineKey = canonicalDraftSnapshot(snapshot);
        this.emit({
          kind: "saved",
          revision: result.revision,
          savedAt: result.savedAt,
        });
        this.scheduleLatestIfNeeded();
        return;
      case "conflict":
        this.hardStop = "conflict";
        this.cancelTimer();
        this.queued = null;
        this.emit({ kind: "conflict" });
        return;
      case "submitted":
        this.hardStop = "submitted";
        this.terminal = {
          status: result.status,
          submittedAt: result.submittedAt,
        };
        this.cancelTimer();
        this.queued = null;
        this.emit({
          kind: "submitted",
          status: result.status,
          submittedAt: result.submittedAt,
        });
        return;
      case "retry":
        // No automatic retry loop: wait for the user or a new actual edit.
        this.cancelTimer();
        this.queued = null;
        this.emit({ kind: "retry" });
        return;
      default: {
        const reason = blockedReason(result);
        this.cancelTimer();
        this.queued = null;
        if (reason !== null) this.emit({ kind: "blocked", reason });
        return;
      }
    }
  }

  private scheduleLatestIfNeeded(): void {
    if (this.stopped || this.hardStop) return;
    if (this.latest === null || this.latestKey === null) return;
    if (this.latestKey === this.baselineKey) {
      this.queued = null;
      return;
    }

    this.queued = null;
    this.emit({ kind: "saving" });
    this.schedule();
  }

  private cancelTimer(): void {
    if (this.timer === null) return;
    this.timers.clearTimeout(this.timer);
    this.timer = null;
  }

  private emitPersistedOrIdle(): void {
    if (this.revision > 0 && this.lastSavedAt !== null) {
      this.emit({
        kind: "saved",
        revision: this.revision,
        savedAt: this.lastSavedAt,
      });
      return;
    }
    this.emit({ kind: "idle" });
  }

  private persistedResult(): RegistrationDraftSaveResult {
    return {
      kind: "saved",
      revision: this.revision,
      savedAt: this.lastSavedAt ?? "",
    };
  }

  private terminalResult(): RegistrationDraftSaveResult {
    if (this.terminal) {
      return {
        kind: "submitted",
        status: this.terminal.status,
        submittedAt: this.terminal.submittedAt,
      };
    }
    return { kind: "retry" };
  }

  private emit(status: DraftAutosaveStatus): void {
    if (this.stopped) return;
    this.onStatus?.(status);
  }
}
