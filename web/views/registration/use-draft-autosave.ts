"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DraftAutosaveCoordinator,
  type DraftAutosaveStatus,
} from "@/lib/events/draft-autosave";
import type {
  RegistrationDraftSaveResult,
  RegistrationDraftSnapshot,
} from "@/lib/events/registration-result";
import { draftSnapshotToFormData } from "./registration-draft";

type UseDraftAutosaveOptions = {
  initialRevision: number;
  initialSnapshot: RegistrationDraftSnapshot;
  initialSavedAt?: string | null;
  saveDraftAction: (
    expectedRevision: number,
    data: FormData,
  ) => Promise<RegistrationDraftSaveResult>;
};

type DraftAutosaveController = {
  status: DraftAutosaveStatus;
  queueDraft: (snapshot: RegistrationDraftSnapshot) => void;
  retry: () => void;
  flush: (
    snapshot: RegistrationDraftSnapshot,
  ) => Promise<RegistrationDraftSaveResult>;
  stop: () => void;
};

function initialStatus(
  revision: number,
  savedAt: string | null | undefined,
): DraftAutosaveStatus {
  if (revision > 0 && savedAt) {
    return { kind: "saved", revision, savedAt };
  }
  return { kind: "idle" };
}

/**
 * Thin React lifecycle around the pure autosave coordinator.
 *
 * The coordinator is created on every effect setup and stopped on cleanup.
 * This intentionally handles React development StrictMode's
 * setup -> cleanup -> setup sequence by creating a fresh, usable coordinator
 * instead of reviving the stopped one.
 */
export function useDraftAutosave({
  initialRevision,
  initialSnapshot,
  initialSavedAt,
  saveDraftAction,
}: UseDraftAutosaveOptions): DraftAutosaveController {
  const saveRef = useRef(saveDraftAction);
  useEffect(() => {
    saveRef.current = saveDraftAction;
  }, [saveDraftAction]);

  const initialRef = useRef<{
    revision: number;
    snapshot: RegistrationDraftSnapshot;
    savedAt: string | null;
  } | null>(null);
  if (initialRef.current === null) {
    initialRef.current = {
      revision: initialRevision,
      snapshot: initialSnapshot,
      savedAt: initialSavedAt ?? null,
    };
  }

  const [status, setStatus] = useState<DraftAutosaveStatus>(() =>
    initialStatus(initialRevision, initialSavedAt),
  );
  const mountedRef = useRef(true);
  const coordinatorRef = useRef<DraftAutosaveCoordinator | null>(null);
  const bufferedSnapshotRef = useRef<RegistrationDraftSnapshot | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    const initial = initialRef.current;
    if (!initial) return;

    const coordinator = new DraftAutosaveCoordinator({
      initialRevision: initial.revision,
      initialSnapshot: initial.snapshot,
      initialSavedAt: initial.savedAt,
      save: (snapshot, expectedRevision) =>
        saveRef.current(expectedRevision, draftSnapshotToFormData(snapshot)),
      onStatus: (next) => {
        // Ignore stopped coordinators and unmounted components.
        if (!mountedRef.current) return;
        setStatus(next);
      },
    });

    coordinatorRef.current = coordinator;

    const buffered = bufferedSnapshotRef.current;
    if (buffered) {
      bufferedSnapshotRef.current = null;
      coordinator.enqueue(buffered);
    }

    return () => {
      mountedRef.current = false;
      coordinator.stop();
      if (coordinatorRef.current === coordinator) {
        coordinatorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    function hasPendingWork(): boolean {
      return coordinatorRef.current?.hasPendingWork() ?? false;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!hasPendingWork()) return;
      event.preventDefault();
      // Legacy browsers require a non-empty returnValue to show a prompt.
      event.returnValue = "";
    }

    function handleAnchorClick(event: MouseEvent) {
      if (!hasPendingWork()) return;
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let destination: URL;
      try {
        destination = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (
        destination.protocol !== "http:" &&
        destination.protocol !== "https:"
      ) {
        return;
      }

      // Hash-only and same-route links do not leave the form.
      if (
        destination.origin === window.location.origin &&
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search
      ) {
        return;
      }

      // Cover real same-window navigation, including the form's back link.
      if (
        !window.confirm(
          "You have progress that may not be saved. Leave this page?",
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, []);

  const queueDraft = useCallback((snapshot: RegistrationDraftSnapshot) => {
    const coordinator = coordinatorRef.current;
    if (coordinator) {
      coordinator.enqueue(snapshot);
      return;
    }
    bufferedSnapshotRef.current = snapshot;
  }, []);

  const retry = useCallback(() => {
    void coordinatorRef.current?.retry();
  }, []);

  const flush = useCallback((snapshot: RegistrationDraftSnapshot) => {
    const coordinator = coordinatorRef.current;
    if (!coordinator) {
      return Promise.resolve<RegistrationDraftSaveResult>({ kind: "retry" });
    }
    return coordinator.flush(snapshot);
  }, []);

  const stop = useCallback(() => {
    coordinatorRef.current?.stop();
  }, []);

  return { status, queueDraft, retry, flush, stop };
}
