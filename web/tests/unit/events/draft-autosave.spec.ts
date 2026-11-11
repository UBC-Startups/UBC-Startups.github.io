import { expect, test } from "@playwright/test";
import {
  DraftAutosaveCoordinator,
  canonicalDraftSnapshot,
  type DraftAutosaveStatus,
  type DraftAutosaveTimers,
} from "../../../lib/events/draft-autosave";
import type {
  RegistrationDraftSaveResult,
  RegistrationDraftSnapshot,
} from "../../../lib/events/registration-result";

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

function snapshot(
  answers: RegistrationDraftSnapshot["answers"] = {},
  agreementKeys: string[] = [],
): RegistrationDraftSnapshot {
  return { answers, agreementKeys };
}

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function createClock(): {
  timers: DraftAutosaveTimers;
  advance: (ms: number) => Promise<void>;
  pending: () => number;
} {
  let now = 0;
  let nextId = 1;
  const scheduled = new Map<number, { at: number; run: () => void }>();

  const timers: DraftAutosaveTimers = {
    setTimeout: (run, delayMs) => {
      const id = nextId;
      nextId += 1;
      scheduled.set(id, { at: now + delayMs, run });
      return id;
    },
    clearTimeout: (handle) => {
      scheduled.delete(handle as number);
    },
  };

  return {
    timers,
    pending: () => scheduled.size,
    advance: async (ms) => {
      now += ms;
      for (;;) {
        const due = Array.from(scheduled.entries())
          .filter(([, timer]) => timer.at <= now)
          .sort((left, right) => left[1].at - right[1].at);
        if (due.length === 0) return;
        for (const [id, timer] of due) {
          if (!scheduled.delete(id)) continue;
          timer.run();
          await settle();
        }
      }
    },
  };
}

function createHarness(
  options: {
    initialRevision?: number;
    initialSnapshot?: RegistrationDraftSnapshot;
    initialSavedAt?: string | null;
    debounceMs?: number;
  } = {},
) {
  const calls: Array<{
    snapshot: RegistrationDraftSnapshot;
    expectedRevision: number;
    deferred: Deferred<RegistrationDraftSaveResult>;
  }> = [];
  const statuses: DraftAutosaveStatus[] = [];
  const clock = createClock();
  const coordinator = new DraftAutosaveCoordinator({
    initialRevision: options.initialRevision ?? 0,
    initialSnapshot: options.initialSnapshot ?? snapshot(),
    initialSavedAt: options.initialSavedAt,
    debounceMs: options.debounceMs ?? 1000,
    timers: clock.timers,
    onStatus: (status) => statuses.push(status),
    save: (nextSnapshot, expectedRevision) => {
      const pending = deferred<RegistrationDraftSaveResult>();
      calls.push({
        snapshot: nextSnapshot,
        expectedRevision,
        deferred: pending,
      });
      return pending.promise;
    },
  });

  return { coordinator, calls, statuses, clock };
}

function saved(revision: number, savedAt = "2026-11-08T12:00:00.000Z") {
  return { kind: "saved", revision, savedAt } as const;
}

test("does not request the initial snapshot on construction", async () => {
  const { calls, statuses, clock } = createHarness({
    initialRevision: 2,
    initialSnapshot: snapshot({ name: "Ada" }, ["terms"]),
    initialSavedAt: "2026-11-08T10:00:00.000Z",
  });

  await clock.advance(10_000);

  expect(calls).toHaveLength(0);
  expect(statuses).toEqual([]);
});

test("debounces a real change and sends it after roughly one second", async () => {
  const { coordinator, calls, clock } = createHarness();
  const next = snapshot({ name: "Ada" });

  coordinator.enqueue(next);
  await clock.advance(999);
  expect(calls).toHaveLength(0);

  await clock.advance(1);
  expect(calls).toHaveLength(1);
  expect(calls[0].snapshot).toEqual(next);
  expect(calls[0].expectedRevision).toBe(0);

  calls[0].deferred.resolve(saved(1));
  await settle();
  expect(coordinator.hasPendingWork()).toBe(false);
});

test("coalesces rapid edits into the latest snapshot", async () => {
  const { coordinator, calls, clock } = createHarness();

  coordinator.enqueue(snapshot({ name: "A" }));
  await clock.advance(400);
  coordinator.enqueue(snapshot({ name: "AB" }));
  await clock.advance(400);
  coordinator.enqueue(snapshot({ name: "ABC" }));
  await clock.advance(999);
  expect(calls).toHaveLength(0);

  await clock.advance(1);
  expect(calls).toHaveLength(1);
  expect(calls[0].snapshot).toEqual(snapshot({ name: "ABC" }));
});

test("keeps one request in flight and coalesces edits during it", async () => {
  const { coordinator, calls, clock } = createHarness();

  coordinator.enqueue(snapshot({ name: "A" }));
  await clock.advance(1000);
  expect(calls).toHaveLength(1);

  coordinator.enqueue(snapshot({ name: "B" }));
  coordinator.enqueue(snapshot({ name: "C" }));
  await clock.advance(5000);
  expect(calls).toHaveLength(1);

  calls[0].deferred.resolve(saved(1));
  await settle();
  expect(calls).toHaveLength(1);

  await clock.advance(1000);
  expect(calls).toHaveLength(2);
  expect(calls[1].snapshot).toEqual(snapshot({ name: "C" }));
  expect(calls[1].expectedRevision).toBe(1);
});

test("does not loop after a failed save and keeps the revision unchanged", async () => {
  const { coordinator, calls, statuses, clock } = createHarness();

  coordinator.enqueue(snapshot({ name: "A" }));
  await clock.advance(1000);
  calls[0].deferred.resolve({ kind: "retry" });
  await settle();

  expect(statuses.at(-1)).toEqual({ kind: "retry" });
  await clock.advance(10_000);
  expect(calls).toHaveLength(1);

  coordinator.enqueue(snapshot({ name: "AB" }));
  await clock.advance(1000);
  expect(calls).toHaveLength(2);
  expect(calls[1].expectedRevision).toBe(0);
});

test("explicit retry sends the latest snapshot with the last successful revision", async () => {
  const { coordinator, calls, clock } = createHarness({
    initialRevision: 4,
    initialSnapshot: snapshot({ name: "Saved" }),
  });

  coordinator.enqueue(snapshot({ name: "Draft" }));
  await clock.advance(1000);
  calls[0].deferred.resolve({ kind: "retry" });
  await settle();

  const retry = coordinator.retry();
  expect(retry).not.toBeNull();
  expect(calls).toHaveLength(2);
  expect(calls[1].snapshot).toEqual(snapshot({ name: "Draft" }));
  expect(calls[1].expectedRevision).toBe(4);

  calls[1].deferred.resolve(saved(5));
  await expect(retry).resolves.toEqual(saved(5));
});

test("a conflict stops automatic saves and retry until the page reloads", async () => {
  const { coordinator, calls, statuses, clock } = createHarness();

  coordinator.enqueue(snapshot({ name: "A" }));
  await clock.advance(1000);
  calls[0].deferred.resolve({ kind: "conflict" });
  await settle();
  expect(statuses.at(-1)).toEqual({ kind: "conflict" });
  expect(coordinator.hasPendingWork()).toBe(true);

  coordinator.enqueue(snapshot({ name: "B" }));
  await clock.advance(5000);
  expect(calls).toHaveLength(1);
  expect(coordinator.retry()).toBeNull();
});

test("a terminal submitted response stops the queue and flushes as a receipt", async () => {
  const { coordinator, calls, statuses, clock } = createHarness();
  const receipt = {
    kind: "submitted",
    status: "pending",
    submittedAt: "2026-11-08T12:00:00.000Z",
  } as const;

  coordinator.enqueue(snapshot({ name: "A" }));
  await clock.advance(1000);
  calls[0].deferred.resolve(receipt);
  await settle();
  expect(statuses.at(-1)).toEqual({
    kind: "submitted",
    status: "pending",
    submittedAt: receipt.submittedAt,
  });

  coordinator.enqueue(snapshot({ name: "B" }));
  await clock.advance(5000);
  expect(calls).toHaveLength(1);
  await expect(coordinator.flush(snapshot({ name: "B" }))).resolves.toEqual(
    receipt,
  );
});

test("flush cancels the debounce and saves the captured snapshot immediately", async () => {
  const { coordinator, calls, clock } = createHarness();

  coordinator.enqueue(snapshot({ name: "Debounced" }));
  const captured = snapshot({ name: "Captured" });
  const flush = coordinator.flush(captured);

  expect(calls).toHaveLength(1);
  expect(calls[0].snapshot).toEqual(captured);
  calls[0].deferred.resolve(saved(1));
  await expect(flush).resolves.toEqual(saved(1));
  await clock.advance(5000);
  expect(calls).toHaveLength(1);
});

test("flush waits for an in-flight save and uses its returned revision", async () => {
  const { coordinator, calls, clock } = createHarness();

  coordinator.enqueue(snapshot({ name: "First" }));
  await clock.advance(1000);
  const first = calls[0].deferred;

  const captured = snapshot({ name: "Final" });
  let settled = false;
  const flush = coordinator.flush(captured).then((result) => {
    settled = true;
    return result;
  });

  await settle();
  expect(settled).toBe(false);
  expect(calls).toHaveLength(1);

  first.resolve(saved(1));
  await settle();
  expect(calls).toHaveLength(2);
  expect(calls[1].snapshot).toEqual(captured);
  expect(calls[1].expectedRevision).toBe(1);

  calls[1].deferred.resolve(saved(2));
  await expect(flush).resolves.toEqual(saved(2));
});

test("flush awaits an in-flight save before honoring a reverted baseline", async () => {
  const persisted = snapshot({ name: "Saved" });
  const interim = snapshot({ name: "Interim" });
  const { coordinator, calls, clock } = createHarness({
    initialRevision: 4,
    initialSnapshot: persisted,
    initialSavedAt: "2026-11-08T10:00:00.000Z",
  });

  coordinator.enqueue(interim);
  await clock.advance(1000);
  expect(calls).toHaveLength(1);
  expect(calls[0].snapshot).toEqual(interim);
  expect(calls[0].expectedRevision).toBe(4);

  // Revert to the persisted snapshot while the interim save is still in
  // flight, then submit (flush) that same persisted snapshot.
  coordinator.enqueue(persisted);
  let settled = false;
  const flush = coordinator.flush(persisted).then((result) => {
    settled = true;
    return result;
  });

  await settle();
  expect(settled).toBe(false);
  expect(calls).toHaveLength(1);

  // Only after the interim save advances the revision may the final request
  // start, and it must carry the new revision rather than the stale one.
  calls[0].deferred.resolve(saved(5));
  await settle();
  expect(settled).toBe(false);
  expect(calls).toHaveLength(2);
  expect(calls[1].snapshot).toEqual(persisted);
  expect(calls[1].expectedRevision).toBe(5);

  calls[1].deferred.resolve(saved(6));
  await expect(flush).resolves.toEqual(saved(6));
});

test("flush does not save again when the snapshot is already persisted", async () => {
  const { coordinator, calls } = createHarness({
    initialRevision: 3,
    initialSnapshot: snapshot({ name: "Saved" }, ["terms"]),
    initialSavedAt: "2026-11-08T10:00:00.000Z",
  });

  await expect(
    coordinator.flush(snapshot({ name: "Saved" }, ["terms"])),
  ).resolves.toEqual(saved(3, "2026-11-08T10:00:00.000Z"));
  expect(calls).toHaveLength(0);
});

test("returning to the persisted snapshot cancels the pending request", async () => {
  const { coordinator, calls, statuses, clock } = createHarness({
    initialRevision: 1,
    initialSnapshot: snapshot({ name: "Saved" }),
    initialSavedAt: "2026-11-08T10:00:00.000Z",
  });

  coordinator.enqueue(snapshot({ name: "Changed" }));
  await clock.advance(400);
  coordinator.enqueue(snapshot({ name: "Saved" }));
  await clock.advance(5000);

  expect(calls).toHaveLength(0);
  expect(statuses.at(-1)).toEqual({
    kind: "saved",
    revision: 1,
    savedAt: "2026-11-08T10:00:00.000Z",
  });
});

test("no-op snapshots are never queued", async () => {
  const { coordinator, calls, clock } = createHarness({
    initialRevision: 2,
    initialSnapshot: snapshot({ name: "Ada" }),
  });

  coordinator.enqueue(snapshot({ name: "Ada" }));
  await clock.advance(5000);
  expect(calls).toHaveLength(0);
});

test("ignores late callbacks after stop", async () => {
  const { coordinator, calls, statuses, clock } = createHarness();

  coordinator.enqueue(snapshot({ name: "A" }));
  await clock.advance(1000);
  expect(calls).toHaveLength(1);

  coordinator.stop();
  calls[0].deferred.resolve(saved(1));
  await settle();

  expect(statuses).toEqual([{ kind: "saving" }]);
  expect(coordinator.hasPendingWork()).toBe(false);
});

test("blocked authentication saves report a reason without retrying automatically", async () => {
  const { coordinator, calls, statuses, clock } = createHarness();

  coordinator.enqueue(snapshot({ name: "A" }));
  await clock.advance(1000);
  calls[0].deferred.resolve({ kind: "sign_in_required" });
  await settle();

  expect(statuses.at(-1)).toEqual({
    kind: "blocked",
    reason: "sign_in_required",
  });
  await clock.advance(10_000);
  expect(calls).toHaveLength(1);
});

test("canonical snapshots ignore answer and agreement key ordering", () => {
  expect(
    canonicalDraftSnapshot(snapshot({ b: "2", a: "1" }, ["two", "one"])),
  ).toBe(
    canonicalDraftSnapshot(snapshot({ a: "1", b: "2" }, ["one", "two"])),
  );
});
