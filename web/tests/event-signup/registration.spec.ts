import { expect, test, type Page } from "@playwright/test";
import {
  createFixtureHarness,
  eventSignupBaseUrl,
  type FixtureHarness,
  type SyntheticUser,
} from "./fixtures/local-supabase";

// Opt-in suite: run with local Supabase and a disposable project. It never
// resets the database or edits an existing CaseHack row.
test.beforeEach(async ({ page }) => {
  await page.route(
    /assets\.mailerlite\.com|googletagmanager\.com|google-analytics\.com|instagram\.com|linkedin\.com/,
    (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "" }),
  );
});

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60_000).toISOString();
}

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60_000).toISOString();
}

async function signIn(page: Page, user: SyntheticUser): Promise<void> {
  await page.context().addCookies(
    user.cookies.map(({ name, value }) => ({
      name,
      value,
      url: eventSignupBaseUrl,
    })),
  );
}

async function expectNoForm(page: Page): Promise<void> {
  await expect(page.locator("form")).toHaveCount(0);
}

async function expectPrivateAnswerHidden(
  page: Page,
  secret: string,
): Promise<void> {
  expect(await page.content()).not.toContain(secret);
}

function closedInstantEvent(
  harness: FixtureHarness,
  name: string,
): ReturnType<FixtureHarness["createEvent"]> {
  return harness.createEvent({
    slug: `event-signup-${name}-${harness.runId}`,
    signupMode: "instant",
    opensAt: hoursAgo(4),
    closesAt: hoursAgo(1),
    capacity: 5,
  });
}

test("a signed-out deep link preserves the registration route through sign-in", async ({
  page,
}) => {
  const path = "/events/casehack-2026/register";
  await page.goto(path);

  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page).toHaveURL(/\/sign-in\?/);
  expect(new URL(page.url()).searchParams.get("next")).toBe(path);
});

test("a signed-in user without a profile returns to setup with the edition", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("missing-profile", {
      profile: false,
    });
    await signIn(page, user);

    const path = "/events/casehack-2026/register";
    await page.goto(path);

    await expect(
      page.getByRole("heading", { name: "Set up your profile" }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/profile\/setup\?/);
    expect(new URL(page.url()).searchParams.get("next")).toBe(path);
  } finally {
    await harness.cleanup();
  }
});

test("an unknown edition shows not-found content and no form", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("unknown-edition");
    await signIn(page, user);

    const response = await page.goto(
      `/events/missing-${harness.runId}/register`,
    );

    expect([200, 404]).toContain(response?.status());
    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
    await expectNoForm(page);
  } finally {
    await harness.cleanup();
  }
});

test("a closed event without a receipt shows the closed state", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("closed");
    await signIn(page, user);
    const event = await closedInstantEvent(harness, "closed");

    await page.goto(`/events/${event.slug}/register`);

    await expect(
      page.getByRole("heading", { name: "Registration is closed" }),
    ).toBeVisible();
    await expectNoForm(page);
  } finally {
    await harness.cleanup();
  }
});

test("a confirmed receipt wins over a closed instant event", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("confirmed");
    await signIn(page, user);
    const event = await closedInstantEvent(harness, "confirmed");
    const secret = `confidential-${harness.runId}-confirmed`;
    await harness.createRegistration({
      eventId: event.id,
      userId: user.id,
      status: "confirmed",
      answers: { private_note: secret },
    });

    await page.goto(`/events/${event.slug}/register`);

    await expect(
      page.getByRole("heading", { name: "You’re registered" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Registration is closed" }),
    ).toHaveCount(0);
    await expectNoForm(page);
    await expectPrivateAnswerHidden(page, secret);
  } finally {
    await harness.cleanup();
  }
});

test("a pending application shows review copy rather than confirmation", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("pending");
    await signIn(page, user);
    const event = await harness.ensureCasehackEvent();
    const secret = `confidential-${harness.runId}-pending`;
    await harness.createRegistration({
      eventId: event.id,
      userId: user.id,
      status: "pending",
      answers: { private_note: secret },
    });

    await page.goto("/events/casehack-2026/register");

    await expect(
      page.getByRole("heading", { name: "Application received" }),
    ).toBeVisible();
    await expect(page.getByText(/pending review/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "You’re registered" }),
    ).toHaveCount(0);
    await expectNoForm(page);
    await expectPrivateAnswerHidden(page, secret);
  } finally {
    await harness.cleanup();
  }
});

test("a declined application shows a clear not-accepted message", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("declined");
    await signIn(page, user);
    const event = await harness.ensureCasehackEvent();
    const secret = `confidential-${harness.runId}-declined`;
    await harness.createRegistration({
      eventId: event.id,
      userId: user.id,
      status: "declined",
      answers: { private_note: secret },
    });

    await page.goto("/events/casehack-2026/register");

    await expect(
      page.getByRole("heading", { name: "Application not accepted" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "You’re registered" }),
    ).toHaveCount(0);
    await expectNoForm(page);
    await expectPrivateAnswerHidden(page, secret);
  } finally {
    await harness.cleanup();
  }
});

test("an open event without a definition never shows a usable form", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("missing-definition");
    await signIn(page, user);
    const event = await harness.createEvent({
      slug: `event-signup-no-definition-${harness.runId}`,
      signupMode: "instant",
      opensAt: hoursAgo(1),
      closesAt: hoursFromNow(1),
      capacity: null,
    });

    await page.goto(`/events/${event.slug}/register`);

    await expect(
      page.getByRole("heading", { name: "Registration is unavailable" }),
    ).toBeVisible();
    await expectNoForm(page);
  } finally {
    await harness.cleanup();
  }
});
