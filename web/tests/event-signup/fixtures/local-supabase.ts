// Opt-in fixtures for the local-Supabase event signup browser suite.
//
// Required environment:
//   LOCAL_SUPABASE_URL, LOCAL_SUPABASE_SERVICE_KEY,
//   LOCAL_SUPABASE_PUBLISHABLE_KEY
//
// These values are read from the process environment only. They are never
// logged. The URL must point at a loopback Supabase instance.

import { randomUUID } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "../../../lib/supabase/database.types";

const loopbackHosts = new Set(["127.0.0.1", "localhost", "::1"]);

export type LocalSupabaseConfig = {
  url: string;
  serviceKey: string;
  publishableKey: string;
};

export const eventSignupBaseUrl =
  process.env.EVENT_SIGNUP_BASE_URL ?? "http://127.0.0.1:3101";

export function assertLoopback(value: string, name: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }

  const host = parsed.hostname.replace(/^\[|\]$/g, "");
  if (!loopbackHosts.has(host)) {
    throw new Error(`${name} must point at a loopback host`);
  }
  return parsed;
}

export function readLocalSupabaseConfig(): LocalSupabaseConfig {
  const url = process.env.LOCAL_SUPABASE_URL;
  const serviceKey = process.env.LOCAL_SUPABASE_SERVICE_KEY;
  const publishableKey = process.env.LOCAL_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !serviceKey || !publishableKey) {
    throw new Error(
      "Set LOCAL_SUPABASE_URL, LOCAL_SUPABASE_SERVICE_KEY, and LOCAL_SUPABASE_PUBLISHABLE_KEY to run the opt-in event signup suite.",
    );
  }

  assertLoopback(url, "LOCAL_SUPABASE_URL");
  return { url, serviceKey, publishableKey };
}

export type BrowserCookie = { name: string; value: string };

export type SyntheticUser = {
  id: string;
  email: string;
  password: string;
  cookies: BrowserCookie[];
};

export type FixtureEvent = {
  id: string;
  slug: string;
  created: boolean;
};

export type EventOptions = {
  slug: string;
  signupMode: "instant" | "application";
  opensAt?: string;
  closesAt?: string;
  capacity?: number | null;
};

export type RegistrationOptions = {
  eventId: string;
  userId: string;
  status: "pending" | "confirmed" | "declined";
  answers?: Json;
};

export type FixtureRegistration = {
  status: string;
  answers: Json;
  draft_agreement_keys: Json;
  revision: number;
  submitted_at: string | null;
  accepted_agreements: Json;
};

export type FixtureHarness = {
  runId: string;
  createUser: (
    name: string,
    options?: { profile?: boolean },
  ) => Promise<SyntheticUser>;
  createEvent: (options: EventOptions) => Promise<FixtureEvent>;
  ensureCasehackEvent: () => Promise<FixtureEvent>;
  createRegistration: (options: RegistrationOptions) => Promise<void>;
  readRegistration: (options: {
    eventId: string;
    userId: string;
  }) => Promise<FixtureRegistration | null>;
  cleanup: () => Promise<void>;
};

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60_000).toISOString();
}

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60_000).toISOString();
}

async function createSessionCookies(
  config: LocalSupabaseConfig,
  email: string,
  password: string,
): Promise<BrowserCookie[]> {
  const jar = new Map<string, string>();
  const supabase = createServerClient<Database>(
    config.url,
    config.publishableKey,
    {
      cookies: {
        getAll() {
          return Array.from(jar, ([name, value]) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            if (value) jar.set(name, value);
            else jar.delete(name);
          }
        },
      },
    },
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const cookies = Array.from(jar, ([name, value]) => ({ name, value }));
  if (cookies.length === 0) {
    throw new Error("Supabase SSR did not write a session cookie.");
  }
  return cookies;
}

function errorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "unknown error";
}

export function createFixtureHarness(): FixtureHarness {
  const config = readLocalSupabaseConfig();
  const service = createClient<Database>(config.url, config.serviceKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  const runId = randomUUID().replaceAll("-", "").slice(0, 12);
  const password = `local-${randomUUID()}`;
  const createdUserIds: string[] = [];
  const createdEventIds: string[] = [];
  const createdRegistrations: Array<{ eventId: string; userId: string }> = [];

  async function createUser(
    name: string,
    options: { profile?: boolean } = {},
  ): Promise<SyntheticUser> {
    const email = `event-signup-${name}-${runId}@example.test`;
    const { data, error } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) {
      throw new Error(`Could not create synthetic user: ${errorMessage(error)}`);
    }

    createdUserIds.push(data.user.id);
    if (options.profile !== false) {
      const { error: profileError } = await service.from("profiles").insert({
        user_id: data.user.id,
        first_name: `Synthetic${data.user.id.slice(0, 4)}`,
        last_name: "Tester",
      });
      if (profileError) throw profileError;
    }

    const cookies = await createSessionCookies(config, email, password);
    return { id: data.user.id, email, password, cookies };
  }

  async function createEvent(options: EventOptions): Promise<FixtureEvent> {
    // Never update an existing row. A developer's shared local stack may
    // already contain a manually tested edition, including CaseHack.
    const { data: existing, error: existingError } = await service
      .from("events")
      .select("id")
      .eq("slug", options.slug)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) {
      return { id: existing.id, slug: options.slug, created: false };
    }

    const { data, error } = await service
      .from("events")
      .insert({
        slug: options.slug,
        registration_opens_at: options.opensAt ?? hoursAgo(2),
        registration_closes_at: options.closesAt ?? hoursFromNow(2),
        capacity: options.capacity ?? null,
        signup_mode: options.signupMode,
      })
      .select("id")
      .single();
    if (error || !data) {
      throw new Error(`Could not create fixture event: ${errorMessage(error)}`);
    }

    createdEventIds.push(data.id);
    return { id: data.id, slug: options.slug, created: true };
  }

  async function createRegistration(
    options: RegistrationOptions,
  ): Promise<void> {
    const { error } = await service.from("event_registrations").insert({
      event_id: options.eventId,
      user_id: options.userId,
      answers: options.answers ?? {},
      accepted_agreements: [],
      status: options.status,
      // Terminal states require submitted_at; the database default was
      // removed so every insert supplies it explicitly.
      submitted_at: new Date().toISOString(),
    });
    if (error) throw error;
    createdRegistrations.push({
      eventId: options.eventId,
      userId: options.userId,
    });
  }

  async function readRegistration(options: {
    eventId: string;
    userId: string;
  }): Promise<FixtureRegistration | null> {
    const { data, error } = await service
      .from("event_registrations")
      .select(
        "status, answers, draft_agreement_keys, revision, submitted_at, accepted_agreements",
      )
      .eq("event_id", options.eventId)
      .eq("user_id", options.userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async function cleanup(): Promise<void> {
    const failures: string[] = [];
    const attempt = async (
      description: string,
      operation: () => PromiseLike<{ error: unknown | null }>,
    ) => {
      try {
        const { error } = await operation();
        if (error) failures.push(`${description}: ${errorMessage(error)}`);
      } catch (error) {
        failures.push(`${description}: ${errorMessage(error)}`);
      }
    };

    for (const { eventId, userId } of createdRegistrations) {
      await attempt("delete event registration", () =>
        service
          .from("event_registrations")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", userId),
      );
    }
    // The UI submits through the app, so rows created during a test are not
    // in createdRegistrations. Remove only rows owned by synthetic test users.
    for (const userId of createdUserIds) {
      await attempt("delete submitted event registration", () =>
        service.from("event_registrations").delete().eq("user_id", userId),
      );
    }
    for (const eventId of createdEventIds) {
      await attempt("delete fixture event", () =>
        service.from("events").delete().eq("id", eventId),
      );
    }
    for (const userId of createdUserIds) {
      await attempt("delete profile", () =>
        service.from("profiles").delete().eq("user_id", userId),
      );
    }
    for (const userId of createdUserIds) {
      await attempt("delete auth user", () =>
        service.auth.admin.deleteUser(userId),
      );
    }

    if (failures.length > 0) {
      throw new Error(`Event signup fixture cleanup failed:\n${failures.join("\n")}`);
    }
  }

  return {
    runId,
    createUser,
    createEvent,
    ensureCasehackEvent: () =>
      createEvent({
        // Real baseline definition, synthetic local row only.
        slug: "casehack-2026",
        signupMode: "application",
        opensAt: hoursAgo(2),
        closesAt: hoursAgo(1),
      }),
    createRegistration,
    readRegistration,
    cleanup,
  };
}
