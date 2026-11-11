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

const dietaryLabels: Record<string, string> = {
  none: "No dietary restrictions",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  halal: "Halal",
  gluten_free: "Gluten-free",
  food_allergy: "Food allergy",
  other: "Other",
};

function dropdownTrigger(page: Page, label: RegExp) {
  return page.getByRole("button", { name: label });
}

async function chooseSingleOption(
  page: Page,
  label: RegExp,
  optionName: string,
): Promise<void> {
  await dropdownTrigger(page, label).click();
  await page.getByRole("option", { name: optionName, exact: true }).click();
}

async function openDietaryOptions(page: Page): Promise<void> {
  await dropdownTrigger(
    page,
    /Do you have any dietary restrictions\?/,
  ).click();
}

async function chooseDietaryOption(
  page: Page,
  value: string,
): Promise<void> {
  const label = dietaryLabels[value];
  if (!label) throw new Error(`Unknown dietary option: ${value}`);
  await page.getByRole("option", { name: label, exact: true }).click();
}

async function chooseCasehackEducation(
  page: Page,
  options: { faculty?: string; major?: string } = {},
): Promise<void> {
  await chooseSingleOption(
    page,
    /Faculty \/ school/,
    options.faculty ?? "Faculty of Science",
  );
  await page
    .locator('input[name="question:major"]')
    .fill(options.major ?? "Computer Science");
}

async function fillCasehackBackground(
  page: Page,
  options: { faculty?: string; major?: string } = {},
): Promise<void> {
  await chooseCasehackEducation(page, options);
  await chooseSingleOption(
    page,
    /What year of study are you in\?/,
    "First year",
  );
}

async function fillCasehackEventDetails(
  page: Page,
  options: {
    dietary: string[];
    dietaryDetails?: string;
    referralOther?: string;
    hackathons?: string;
  },
): Promise<void> {
  await chooseSingleOption(
    page,
    /How many hackathons have you participated in before\?/,
    options.hackathons ?? "0",
  );

  if (options.dietary.length > 0) {
    await openDietaryOptions(page);
    for (const value of options.dietary) {
      await chooseDietaryOption(page, value);
    }
    await page.keyboard.press("Escape");
    if (options.dietaryDetails !== undefined) {
      await page
        .locator('textarea[name="question:dietary_details"]')
        .fill(options.dietaryDetails);
    }
  }

  if (options.referralOther !== undefined) {
    await chooseSingleOption(
      page,
      /How did you hear about CaseHack\?/,
      "Other",
    );
    await page
      .locator('input[name="question:referral_other"]')
      .fill(options.referralOther);
  }
}

async function continueStep(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}

async function fillCasehackApplication(
  page: Page,
  options: {
    dietary: string[];
    dietaryDetails?: string;
    referralOther?: string;
    includeFinalAgreement?: boolean;
    motivation?: string;
    contribution?: string;
  },
): Promise<void> {
  await fillCasehackBackground(page);
  await continueStep(page);
  await fillCasehackEventDetails(page, options);
  await continueStep(page);
  await page
    .locator('textarea[name="question:participation_motivation"]')
    .fill(options.motivation ?? "I want to build something useful with a team.");
  await page
    .locator('textarea[name="question:team_contribution"]')
    .fill(options.contribution ?? "I bring calm prototyping and frontend skills.");
  await continueStep(page);

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

function words(count: number): string {
  return Array.from({ length: count }, (_, index) => `word${index}`).join(" ");
}

function currentStep(page: Page) {
  return page.locator(
    'nav[aria-label="Registration steps"] button[aria-current="step"]',
  );
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

test("server errors in a hidden earlier step select that panel and keep answers", async ({
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

    await fillCasehackBackground(page);
    await continueStep(page);
    await fillCasehackEventDetails(page, {
      dietary: ["food_allergy"],
      dietaryDetails: "Peanuts",
      referralOther: "A friend's poster",
    });
    await expect(
      page.locator('textarea[name="question:dietary_details"]'),
    ).toBeVisible();
    await expect(
      page.locator('input[name="question:referral_other"]'),
    ).toBeVisible();

    await continueStep(page);
    await page
      .locator('textarea[name="question:participation_motivation"]')
      .fill("I want to build something useful with a team.");
    await page
      .locator('textarea[name="question:team_contribution"]')
      .fill("I bring calm prototyping and frontend skills.");
    await continueStep(page);

    for (const id of [
      "application_status",
      "participant_conduct",
      "application_data",
      "photo_video_consent",
    ]) {
      await page.locator(`input[name="agreement:${id}"]`).check();
    }

    // Clear the now-hidden background details so the authoritative server
    // reports them missing after the final step. This exercises the panel
    // selection for errors that are no longer visible on the current step.
    await page.evaluate(() => {
      const textarea = document.querySelector<HTMLTextAreaElement>(
        'textarea[name="question:dietary_details"]',
      );
      const input = document.querySelector<HTMLInputElement>(
        'input[name="question:referral_other"]',
      );
      if (!textarea || !input) throw new Error("Hidden fields are missing.");
      const textareaSetter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      const inputSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      textareaSetter?.call(textarea, "");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      inputSetter?.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    await submitRegistration(page);

    await expect(
      page.getByText("This field is required.", { exact: true }),
    ).toHaveCount(2);
    await expect(
      page.getByText("Check this agreement to continue.", { exact: true }),
    ).toHaveCount(1);
    await expect(currentStep(page)).toHaveAccessibleName(/Event details/);
    await expect(
      page.locator('textarea[name="question:dietary_details"]'),
    ).toHaveAttribute("aria-invalid", "true");

    await expect(
      page.locator('input[name="question:major"]'),
    ).toHaveValue("Computer Science");
    await expect(
      page.locator('input[name="question:year_of_study"]'),
    ).toHaveValue("1");
    await expect(
      page.locator('input[name="question:previous_hackathons"]'),
    ).toHaveValue("0");
    await expect(
      page.locator(
        'input[name="question:dietary_restrictions"][value="food_allergy"]',
      ),
    ).toHaveCount(1);
    await expect(
      page.locator('input[name="question:referral_source"]'),
    ).toHaveValue("other");
    await expect(
      page.locator('textarea[name="question:dietary_details"]'),
    ).toHaveValue("");
    await expect(
      page.locator('input[name="question:referral_other"]'),
    ).toHaveValue("");
    await expect(
      page.locator('textarea[name="question:participation_motivation"]'),
    ).toHaveValue("I want to build something useful with a team.");
    await expect(
      page.locator('input[name="agreement:submission_finality"]'),
    ).not.toBeChecked();
  } finally {
    await harness.cleanup();
  }
});

test("valid progression preserves answers, counters, and agreements", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("steps-progress");
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

    await fillCasehackBackground(page);
    await continueStep(page);
    await expect(currentStep(page)).toHaveAccessibleName(/Event details/);
    await fillCasehackEventDetails(page, { dietary: ["vegetarian"] });
    await continueStep(page);
    await expect(currentStep(page)).toHaveAccessibleName(/Application questions/);

    const motivation = words(150);
    const contribution = "I bring calm prototyping and frontend skills.";
    await page
      .locator('textarea[name="question:participation_motivation"]')
      .fill(motivation);
    await page
      .locator('textarea[name="question:team_contribution"]')
      .fill(contribution);

    const motivationCounter = page.locator(
      'p[id$="participation_motivation-description-counter"]',
    );
    await expect(motivationCounter).toHaveText("150 / 150 words");

    // Let the debounced draft save finish, then reload into the same session.
    await expect(
      page.getByText("Progress saved", { exact: true }),
    ).toBeVisible({ timeout: 15_000 });
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Registration", exact: true }),
    ).toBeVisible();

    // The first incomplete step is Agreements; no required errors appear
    // until the attendee tries to advance.
    await expect(currentStep(page)).toHaveAccessibleName(/Agreements/);
    await expect(
      page.getByText("This field is required.", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText(
        "I understand that submitting this application does not confirm my place at CaseHack. UBC Startups will contact me about my application outcome.",
        { exact: true },
      ),
    ).toBeVisible();
    await page
      .locator('input[name="agreement:application_status"]')
      .check();

    await page
      .getByRole("navigation", { name: "Registration steps" })
      .getByRole("button", { name: "Application questions" })
      .click();
    await expect(
      page.locator('textarea[name="question:participation_motivation"]'),
    ).toHaveValue(motivation);
    await expect(motivationCounter).toHaveText("150 / 150 words");

    await page
      .getByRole("navigation", { name: "Registration steps" })
      .getByRole("button", { name: "Background" })
      .click();
    await expect(
      page.locator('input[name="question:year_of_study"]'),
    ).toHaveValue("1");
    await expect(
      page.locator('input[name="question:major"]'),
    ).toHaveValue("Computer Science");
    await expect(
      page.locator('input[name="question:dietary_restrictions"]'),
    ).toHaveCount(1);

    await continueStep(page);
    await continueStep(page);
    await continueStep(page);
    await expect(currentStep(page)).toHaveAccessibleName(/Agreements/);
    await expect(
      page.locator('input[name="agreement:application_status"]'),
    ).toBeChecked();
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
    ).not.toBeVisible();

    await fillCasehackApplication(page, {
      dietary: ["vegetarian", "gluten_free"],
      referralOther: "Met a volunteer",
      includeFinalAgreement: true,
    });
    await expect(currentStep(page)).toHaveAccessibleName(/Agreements/);
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

    // Wait for the debounced save before submitting. The working row is a
    // draft with checkbox ids only, not a terminal acceptance snapshot.
    await expect(
      page.getByText("Progress saved", { exact: true }),
    ).toBeVisible({ timeout: 15_000 });
    const draft = await harness.readRegistration({
      eventId: event.id,
      userId: user.id,
    });
    expect(draft?.status).toBe("draft");
    expect(draft?.submitted_at).toBeNull();
    expect(draft?.accepted_agreements).toEqual([]);
    expect(draft?.draft_agreement_keys).toEqual(
      expect.arrayContaining([
        "application_status",
        "participant_conduct",
        "application_data",
        "photo_video_consent",
        "submission_finality",
      ]),
    );

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
    expect(saved?.submitted_at).not.toBeNull();
    expect(saved?.accepted_agreements).toHaveLength(5);
    expect(saved?.answers).toMatchObject({
      faculty: "science",
      major: "Computer Science",
      year_of_study: "1",
      previous_hackathons: "0",
      dietary_restrictions: ["vegetarian", "gluten_free"],
      referral_source: "other",
      referral_other: "Met a volunteer",
      participation_motivation:
        "I want to build something useful with a team.",
      team_contribution: "I bring calm prototyping and frontend skills.",
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
    const holder = await harness.createUser("instant-full-holder");
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

    // Instant mode is full once capacity is reached.
    const capacityEvent = await harness.createEvent({
      slug: `casehack-2026-full-${harness.runId}`,
      signupMode: "instant",
      opensAt: hoursAgo(1),
      closesAt: hoursFromNow(2),
      capacity: 1,
    });
    await harness.createRegistration({
      eventId: capacityEvent.id,
      userId: holder.id,
      status: "confirmed",
    });

    await page.goto(`/events/${capacityEvent.slug}/register`);
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

test("pending and declined applications show their receipt copy", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const event = await harness.ensureCasehackEvent();
    const cases = [
      {
        status: "pending" as const,
        heading: "Application received",
        copy: /Your application is pending review/i,
      },
      {
        status: "declined" as const,
        heading: "Application not accepted",
        copy: /This application was not accepted/i,
      },
    ];

    for (const entry of cases) {
      const user = await harness.createUser(`receipt-${entry.status}`);
      const secret = `confidential-${harness.runId}-${entry.status}`;
      await harness.createRegistration({
        eventId: event.id,
        userId: user.id,
        status: entry.status,
        answers: { private_note: secret },
      });

      await page.context().clearCookies();
      await signIn(page, user);
      await page.goto("/events/casehack-2026/register");

      await expect(
        page.getByRole("heading", { name: entry.heading }),
      ).toBeVisible();
      await expect(page.getByText(entry.copy)).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "You’re registered" }),
      ).toHaveCount(0);
      await expectNoForm(page);
      await expectPrivateAnswerHidden(page, secret);
    }
  } finally {
    await harness.cleanup();
  }
});

