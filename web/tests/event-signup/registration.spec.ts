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

async function openDietaryOptions(page: Page): Promise<void> {
  await page
    .locator("summary")
    .filter({ hasText: "Select options" })
    .click();
}

async function fillCasehackApplication(
  page: Page,
  options: {
    dietary: string[];
    referralOther?: string;
    includeFinalAgreement?: boolean;
  },
): Promise<void> {
  await page.locator('input[name="question:program"]').fill("Computer Science");
  await page
    .locator('select[name="question:year_of_study"]')
    .selectOption("1");
  await page
    .locator('select[name="question:previous_hackathons"]')
    .selectOption("0");

  if (options.dietary.length > 0) {
    await openDietaryOptions(page);
    for (const value of options.dietary) {
      await page
        .locator(
          `input[name="question:dietary_restrictions"][value="${value}"]`,
        )
        .check();
    }
  }

  if (options.referralOther !== undefined) {
    await page
      .locator('select[name="question:referral_source"]')
      .selectOption("other");
    await page
      .locator('input[name="question:referral_other"]')
      .fill(options.referralOther);
  }

  const agreementIds = [
    "application_status",
    "participant_conduct",
    "application_data",
    "photo_video_consent",
    ...(options.includeFinalAgreement ? ["submission_finality"] : []),
  ];
  for (const id of agreementIds) {
    await page.locator(`input[name="agreement:${id}"]`).check();
  }
}

async function submitRegistration(page: Page): Promise<void> {
  await page
    .getByRole("button", { name: "Submit registration" })
    .click();
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

test("conditional details and the final agreement report server errors and keep answers", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("form-errors");
    await signIn(page, user);
    const event = await harness.createEvent({
      slug: "casehack-2026",
      signupMode: "application",
      opensAt: hoursAgo(1),
      closesAt: hoursFromNow(2),
      capacity: null,
    });
    expect(event.created).toBe(true);

    await page.goto("/events/casehack-2026/register");
    await expect(
      page.getByRole("heading", { name: "Registration", exact: true }),
    ).toBeVisible();

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    await page.locator('input[name="question:program"]').fill("Computer Science");
    await page
      .locator('select[name="question:year_of_study"]')
      .selectOption("1");
    await page
      .locator('select[name="question:previous_hackathons"]')
      .selectOption("0");

    await openDietaryOptions(page);
    const allergy = page.locator(
      'input[name="question:dietary_restrictions"][value="food_allergy"]',
    );

    await allergy.check();
    await expect(
      page.locator('textarea[name="question:dietary_details"]'),
    ).toBeVisible();

    await page
      .locator('select[name="question:referral_source"]')
      .selectOption("other");
    await expect(
      page.locator('input[name="question:referral_other"]'),
    ).toBeVisible();

    await fillCasehackApplication(page, {
      dietary: [],
    });

    await submitRegistration(page);

    await expect(
      page.getByText("This field is required.", { exact: true }),
    ).toHaveCount(2);
    await expect(
      page.getByText("Check this agreement to continue.", { exact: true }),
    ).toHaveCount(1);
    await expect(
      page.locator('textarea[name="question:dietary_details"]'),
    ).toBeFocused();

    await expect(page.locator('input[name="question:program"]')).toHaveValue(
      "Computer Science",
    );
    await expect(
      page.locator('select[name="question:year_of_study"]'),
    ).toHaveValue("1");
    await expect(
      page.locator('select[name="question:previous_hackathons"]'),
    ).toHaveValue("0");
    await expect(allergy).toBeChecked();
    await expect(
      page.locator('select[name="question:referral_source"]'),
    ).toHaveValue("other");
    await expect(
      page.locator('textarea[name="question:dietary_details"]'),
    ).toHaveValue("");
    await expect(
      page.locator('input[name="agreement:submission_finality"]'),
    ).not.toBeChecked();
  } finally {
    await harness.cleanup();
  }
});

test("selecting none clears conditional details and stays exclusive", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("form-exclusive");
    await signIn(page, user);
    const event = await harness.createEvent({
      slug: "casehack-2026",
      signupMode: "application",
      opensAt: hoursAgo(1),
      closesAt: hoursFromNow(2),
      capacity: null,
    });
    expect(event.created).toBe(true);

    await page.goto("/events/casehack-2026/register");

    await openDietaryOptions(page);
    const allergy = page.locator(
      'input[name="question:dietary_restrictions"][value="food_allergy"]',
    );
    const none = page.locator(
      'input[name="question:dietary_restrictions"][value="none"]',
    );
    const vegetarian = page.locator(
      'input[name="question:dietary_restrictions"][value="vegetarian"]',
    );

    await allergy.check();
    await page
      .locator('textarea[name="question:dietary_details"]')
      .fill("Peanuts");

    // Selecting none clears the other choices and removes the now-inactive
    // conditional detail field from the request.
    await none.check();
    await expect(allergy).not.toBeChecked();
    await expect(none).toBeChecked();
    await expect(
      page.locator('textarea[name="question:dietary_details"]'),
    ).toHaveCount(0);

    await vegetarian.check();
    await expect(none).not.toBeChecked();
    await expect(vegetarian).toBeChecked();
  } finally {
    await harness.cleanup();
  }
});

test("a complete application submits as pending and reloads with its receipt", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("application-submit");
    await signIn(page, user);
    const event = await harness.createEvent({
      slug: "casehack-2026",
      signupMode: "application",
      opensAt: hoursAgo(1),
      closesAt: hoursFromNow(2),
      capacity: null,
    });
    expect(event.created).toBe(true);

    await page.goto("/events/casehack-2026/register");

    await expect(page.locator('input[name^="agreement:"]')).toHaveCount(5);
    await expect(
      page.getByText(
        "I understand that submitting this application does not confirm my place at CaseHack. UBC Startups will contact me about my application outcome.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: /I understand that submitting this application/,
      }),
    ).toHaveCount(0);

    await fillCasehackApplication(page, {
      dietary: ["vegetarian", "gluten_free"],
      referralOther: "Met a volunteer",
      includeFinalAgreement: true,
    });
    await submitRegistration(page);

    await expect(
      page.getByRole("heading", { name: "Application received" }),
    ).toBeVisible();
    await expect(page.getByText(/pending review/i)).toBeVisible();

    const saved = await harness.readRegistration({
      eventId: event.id,
      userId: user.id,
    });
    expect(saved?.status).toBe("pending");
    expect(saved?.answers).toMatchObject({
      program: "Computer Science",
      year_of_study: "1",
      previous_hackathons: "0",
      dietary_restrictions: ["vegetarian", "gluten_free"],
      referral_source: "other",
      referral_other: "Met a volunteer",
    });

    await page.reload();

    await expect(
      page.getByRole("heading", { name: "Application received" }),
    ).toBeVisible();
    await expect(page.getByText(/pending review/i)).toBeVisible();
    await expectNoForm(page);
  } finally {
    await harness.cleanup();
  }
});

test("an instant CaseHack row confirms the submission and reloads its receipt", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("instant-submit");
    await signIn(page, user);
    const event = await harness.createEvent({
      slug: "casehack-2026",
      signupMode: "instant",
      opensAt: hoursAgo(1),
      closesAt: hoursFromNow(2),
      capacity: null,
    });
    expect(event.created).toBe(true);

    await page.goto("/events/casehack-2026/register");
    await fillCasehackApplication(page, {
      dietary: ["none"],
      includeFinalAgreement: true,
    });
    await submitRegistration(page);

    await expect(
      page.getByRole("heading", { name: "You’re registered" }),
    ).toBeVisible();

    const saved = await harness.readRegistration({
      eventId: event.id,
      userId: user.id,
    });
    expect(saved?.status).toBe("confirmed");
    expect(saved?.answers).toMatchObject({
      dietary_restrictions: ["none"],
    });

    await page.reload();

    await expect(
      page.getByRole("heading", { name: "You’re registered" }),
    ).toBeVisible();
    await expectNoForm(page);
  } finally {
    await harness.cleanup();
  }
});

test("an instant CaseHack row at capacity shows full without a form", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("instant-full");
    const holder = await harness.createUser("instant-full-holder");
    await signIn(page, user);
    const event = await harness.createEvent({
      slug: "casehack-2026",
      signupMode: "instant",
      opensAt: hoursAgo(1),
      closesAt: hoursFromNow(2),
      capacity: 1,
    });
    expect(event.created).toBe(true);
    await harness.createRegistration({
      eventId: event.id,
      userId: holder.id,
      status: "confirmed",
    });

    await page.goto("/events/casehack-2026/register");

    await expect(
      page.getByRole("heading", { name: "Registration is full" }),
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
