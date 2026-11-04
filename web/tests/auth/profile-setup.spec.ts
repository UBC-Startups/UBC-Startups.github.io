import { expect, test } from "@playwright/test";
import { parseBasicProfile, saveBasicProfileRow } from "../../lib/auth/profile-setup";

const event = "/events/sample-event/register";
const userId = "11111111-1111-4111-8111-111111111111";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

test("trims names and keeps the validated destination", () => {
  const parsed = parseBasicProfile(
    form({ first_name: "  Ada ", last_name: " Lovelace  ", next: event }),
  );

  expect(parsed).toEqual({
    destination: event,
    firstName: "Ada",
    lastName: "Lovelace",
  });
});

test("rejects a whitespace-only name and keeps the destination", () => {
  const parsed = parseBasicProfile(
    form({ first_name: "   ", last_name: "Lovelace", next: event }),
  );

  expect(parsed).toEqual({
    destination: event,
    error: "Enter your first and last name.",
  });
});

test("rejects a missing name and keeps the destination", () => {
  const parsed = parseBasicProfile(form({ first_name: "Ada", next: event }));

  expect(parsed).toEqual({
    destination: event,
    error: "Enter your first and last name.",
  });
});

test("rejects an unsafe destination and falls back to /events", () => {
  const parsed = parseBasicProfile(
    form({ first_name: "Ada", last_name: "Lovelace", next: "//example.org" }),
  );

  expect(parsed).toEqual({
    destination: "/events",
    firstName: "Ada",
    lastName: "Lovelace",
  });
});

function fakeClient(options: {
  insertError: { code?: string } | null;
  existing?: { data: { user_id: string } | null; error: unknown };
}) {
  const calls: Array<{ operation: string; values?: unknown }> = [];
  const client = {
    from() {
      return {
        insert(values: unknown) {
          calls.push({ operation: "insert", values });
          return Promise.resolve({ error: options.insertError });
        },
        select() {
          return {
            eq() {
              return {
                maybeSingle() {
                  calls.push({ operation: "select" });
                  return Promise.resolve(
                    options.existing ?? { data: null, error: null },
                  );
                },
              };
            },
          };
        },
      };
    },
  };
  return { calls, client };
}

test("saves the trimmed profile under the verified user id", async () => {
  const fake = fakeClient({ insertError: null });

  const result = await saveBasicProfileRow(
    fake.client as never,
    userId,
    "Ada",
    "Lovelace",
  );

  expect(result).toEqual({});
  expect(fake.calls).toEqual([
    {
      operation: "insert",
      values: { user_id: userId, first_name: "Ada", last_name: "Lovelace" },
    },
  ]);
});

test("accepts a duplicate insert when the profile now exists", async () => {
  const fake = fakeClient({
    insertError: { code: "23505" },
    existing: { data: { user_id: userId }, error: null },
  });

  const result = await saveBasicProfileRow(
    fake.client as never,
    userId,
    "Ada",
    "Lovelace",
  );

  expect(result).toEqual({});
  expect(fake.calls.map((call) => call.operation)).toEqual(["insert", "select"]);
});

test("reports a duplicate insert when the profile cannot be read", async () => {
  const fake = fakeClient({
    insertError: { code: "23505" },
    existing: { data: null, error: null },
  });

  const result = await saveBasicProfileRow(
    fake.client as never,
    userId,
    "Ada",
    "Lovelace",
  );

  expect(result).toEqual({ error: "Could not save your profile. Please try again." });
});

test("reports a non-duplicate insert failure", async () => {
  const fake = fakeClient({ insertError: { code: "42501" } });

  const result = await saveBasicProfileRow(
    fake.client as never,
    userId,
    "Ada",
    "Lovelace",
  );

  expect(result).toEqual({ error: "Could not save your profile. Please try again." });
  expect(fake.calls.map((call) => call.operation)).toEqual(["insert"]);
});
