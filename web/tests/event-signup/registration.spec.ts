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
    await expect(currentStep(page)).toHaveText(/Event details/);
    await expect(
      page.locator('textarea[name="question:dietary_details"]'),
    ).toBeFocused();

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

test("blank background Continue stays on the first step with inline errors", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("steps-blank");
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

    await expect(currentStep(page)).toHaveText(/Background/);
    await continueStep(page);

    await expect(currentStep(page)).toHaveText(/Background/);
    await expect(
      page.getByRole("button", { name: "Event details" }),
    ).not.toHaveAttribute("aria-current", "step");
    await expect(
      page.getByText("This field is required.", { exact: true }),
    ).toHaveCount(3);
    await expect(
      page.getByRole("button", { name: /Faculty \/ school/ }),
    ).toBeFocused();
  } finally {
    await harness.cleanup();
  }
});

test("major is required free text and stays independent of faculty", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("steps-faculty");
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

    const major = page.locator('input[name="question:major"]');
    await expect(major).toHaveJSProperty("type", "text");
    await expect(major).toHaveAttribute("maxlength", "120");
    await expect(
      page.getByRole("button", { name: /Major \/ program/ }),
    ).toHaveCount(0);

    await chooseSingleOption(
      page,
      /Faculty \/ school/,
      "Faculty of Science",
    );
    await major.fill("Computer Science");
    await chooseSingleOption(page, /Faculty \/ school/, "Faculty of Arts");

    await expect(major).toHaveValue("Computer Science");
  } finally {
    await harness.cleanup();
  }
});

test("progress pills expose four accessible steps and the desktop form fits the viewport", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("steps-viewport");
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

    const nav = page.getByRole("navigation", { name: "Registration steps" });
    await expect(nav.getByRole("button")).toHaveCount(4);

    for (const name of [
      "Background",
      "Event details",
      "Application questions",
      "Agreements",
    ]) {
      const button = nav.getByRole("button", { name, exact: true });
      await expect(button).toBeVisible();
      await expect(button).toHaveAttribute("aria-label", name);
    }

    await expect(currentStep(page)).toHaveAccessibleName("Background");
    await expect(currentStep(page)).toHaveAttribute("aria-current", "step");

    const barHeights = await nav
      .locator("button > span")
      .evaluateAll((bars) =>
        bars.map((bar) => bar.getBoundingClientRect().height),
      );
    expect(barHeights).toHaveLength(4);
    for (const height of barHeights) expect(height).toBeGreaterThanOrEqual(5);
    expect(Math.max(...barHeights) - Math.min(...barHeights)).toBeLessThanOrEqual(
      1,
    );

    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 1366, height: 768 },
    ]) {
      await page.setViewportSize(viewport);
      const metrics = await page.evaluate(() => {
        const grid = document.querySelector("main > div");
        const [brand, panel] = grid
          ? Array.from(grid.children).map((child) =>
              child.getBoundingClientRect(),
            )
          : [];
        return {
          scrollHeight: document.documentElement.scrollHeight,
          innerHeight: window.innerHeight,
          brandBottom: brand?.bottom ?? null,
          panelBottom: panel?.bottom ?? null,
        };
      });

      expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.innerHeight + 1);
      expect(metrics.brandBottom).not.toBeNull();
      expect(metrics.panelBottom).not.toBeNull();
      expect(
        Math.abs((metrics.brandBottom ?? 0) - (metrics.panelBottom ?? 0)),
      ).toBeLessThanOrEqual(1);

      const continueButton = page.getByRole("button", {
        name: "Continue",
        exact: true,
      });
      await expect(continueButton).toBeVisible();
      const box = await continueButton.boundingBox();
      if (!box) throw new Error("Could not measure the Continue footer.");
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);

      // The scrolling panel's padding must leave room for the native focus
      // outline (2px at 3px offset) instead of clipping it at the left edge.
      const major = page.locator('input[name="question:major"]');
      await major.focus();
      const focusMetrics = await major.evaluate((element) => {
        const region = element.closest<HTMLElement>(
          "[data-registration-scroll]",
        );
        if (!region) throw new Error("Missing registration scroll region.");
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const reach =
          (Number.parseFloat(style.outlineWidth) || 0) +
          (Number.parseFloat(style.outlineOffset) || 0);
        return {
          focusVisible: element.matches(":focus-visible"),
          outlineLeft: rect.left - reach,
          regionLeft: region.getBoundingClientRect().left,
        };
      });
      expect(focusMetrics.focusVisible).toBe(true);
      expect(focusMetrics.outlineLeft).toBeGreaterThanOrEqual(
        focusMetrics.regionLeft,
      );
    }
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
    await expect(currentStep(page)).toHaveText(/Event details/);
    await fillCasehackEventDetails(page, { dietary: ["vegetarian"] });
    await continueStep(page);
    await expect(currentStep(page)).toHaveText(/Application questions/);

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
    await expect(currentStep(page)).toHaveText(/Agreements/);
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
    await expect(currentStep(page)).toHaveText(/Agreements/);
    await expect(
      page.locator('input[name="agreement:application_status"]'),
    ).toBeChecked();
  } finally {
    await harness.cleanup();
  }
});

test("word counters block 151 words and clear after trimming to 150", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("steps-words");
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
    await fillCasehackEventDetails(page, { dietary: ["none"] });
    await continueStep(page);

    const motivation = page.locator(
      'textarea[name="question:participation_motivation"]',
    );
    const counter = page.locator(
      'p[id$="participation_motivation-description-counter"]',
    );
    await motivation.fill(words(150));
    await expect(counter).toHaveText("150 / 150 words");
    await expect(
      page.getByText("Use 150 words or fewer.", { exact: true }),
    ).toHaveCount(0);

    await motivation.fill(words(151));
    await expect(counter).toHaveText("151 / 150 words");
    await expect(
      page.getByText("Use 150 words or fewer.", { exact: true }),
    ).toHaveCount(1);

    await continueStep(page);
    await expect(currentStep(page)).toHaveText(/Application questions/);

    await motivation.fill(words(150));
    await expect(counter).toHaveText("150 / 150 words");
    await expect(
      page.getByText("Use 150 words or fewer.", { exact: true }),
    ).toHaveCount(0);

    await page
      .locator('textarea[name="question:team_contribution"]')
      .fill("A short contribution.");
    await continueStep(page);
    await expect(currentStep(page)).toHaveText(/Agreements/);
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
    await fillCasehackBackground(page);
    await continueStep(page);

    await openDietaryOptions(page);
    const allergy = page.getByRole("option", {
      name: "Food allergy",
      exact: true,
    });
    const none = page.getByRole("option", {
      name: "No dietary restrictions",
      exact: true,
    });
    const vegetarian = page.getByRole("option", {
      name: "Vegetarian",
      exact: true,
    });

    await allergy.click();
    await page
      .locator('textarea[name="question:dietary_details"]')
      .fill("Peanuts");

    // The detail field takes focus outside the menu, so reopen it before
    // exercising the exclusive option.
    await openDietaryOptions(page);

    // Selecting none clears the other choices and removes the now-inactive
    // conditional detail field from the request.
    await none.click();
    await expect(allergy).toHaveAttribute("aria-selected", "false");
    await expect(none).toHaveAttribute("aria-selected", "true");
    await expect(
      page.locator(
        'input[name="question:dietary_restrictions"][value="food_allergy"]',
      ),
    ).toHaveCount(0);
    await expect(
      page.locator(
        'input[name="question:dietary_restrictions"][value="none"]',
      ),
    ).toHaveCount(1);
    await expect(
      page.locator('textarea[name="question:dietary_details"]'),
    ).toHaveCount(0);

    await vegetarian.click();
    await expect(none).toHaveAttribute("aria-selected", "false");
    await expect(vegetarian).toHaveAttribute("aria-selected", "true");
    await expect(
      page.locator('input[name="question:dietary_restrictions"]'),
    ).toHaveCount(1);
  } finally {
    await harness.cleanup();
  }
});

test("keyboard Enter in a dropdown selects without advancing or injecting errors", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("dropdown-enter");
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

    const yearTrigger = page.getByRole("button", {
      name: /What year of study are you in\?/,
    });
    await yearTrigger.focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(
      page.locator('input[name="question:year_of_study"]'),
    ).toHaveValue("2");
    await expect(yearTrigger).toBeFocused();
    await expect(currentStep(page)).toHaveText(/Background/);
    await expect(
      page.getByRole("button", { name: "Event details" }),
    ).not.toHaveAttribute("aria-current", "step");
    await expect(
      page.getByText("This field is required.", { exact: true }),
    ).toHaveCount(0);
  } finally {
    await harness.cleanup();
  }
});

test("custom dropdowns support keyboard selection, Escape, and inset chevrons", async ({
  page,
}) => {
  const harness = createFixtureHarness();
  try {
    const user = await harness.createUser("dropdown-keyboard");
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
    await expect(page.locator("select")).toHaveCount(0);

    const yearTrigger = page.getByRole("button", {
      name: /What year of study are you in\?/,
    });

    await yearTrigger.focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(
      page.locator('input[name="question:year_of_study"]'),
    ).toHaveValue("2");
    await expect(yearTrigger).toBeFocused();

    const triggerBox = await yearTrigger.boundingBox();
    const chevronBox = await yearTrigger.locator("svg").boundingBox();
    if (!triggerBox || !chevronBox) {
      throw new Error("Could not measure the dropdown trigger.");
    }
    const chevronInset =
      triggerBox.x + triggerBox.width - (chevronBox.x + chevronBox.width);
    expect(chevronInset).toBeGreaterThanOrEqual(19);
    expect(chevronInset).toBeLessThanOrEqual(24);

    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(yearTrigger).toBeFocused();
    await expect(
      page.locator('input[name="question:year_of_study"]'),
    ).toHaveValue("2");

    // Required questions never offer the blank option.
    await yearTrigger.click();
    await expect(
      page.getByRole("option", { name: "No selection", exact: true }),
    ).toHaveCount(0);
    await page.keyboard.press("Escape");

    await chooseSingleOption(
      page,
      /Faculty \/ school/,
      "Faculty of Science",
    );
    await page.locator('input[name="question:major"]').fill("Computer Science");
    await continueStep(page);
    await expect(currentStep(page)).toHaveText(/Event details/);

    const referralTrigger = page.getByRole("button", {
      name: /How did you hear about CaseHack\?/,
    });

    // Typeahead moves to the matching option without leaving the listbox.
    await referralTrigger.click();
    await expect(
      page.getByRole("option", { name: "No selection", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("l");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(
      page.locator('input[name="question:referral_source"]'),
    ).toHaveValue("linkedin");
    await expect(referralTrigger).toBeFocused();

    // An optional answer can return to the blank placeholder.
    await referralTrigger.click();
    await page
      .getByRole("option", { name: "No selection", exact: true })
      .click();
    await expect(
      page.locator('input[name="question:referral_source"]'),
    ).toHaveCount(0);
    await expect(referralTrigger).toContainText("Select an option");

    // Clearing "Other" removes its conditional detail field.
    await chooseSingleOption(
      page,
      /How did you hear about CaseHack\?/,
      "Other",
    );
    await expect(
      page.locator('input[name="question:referral_other"]'),
    ).toBeVisible();
    await referralTrigger.click();
    await page
      .getByRole("option", { name: "No selection", exact: true })
      .click();
    await expect(
      page.locator('input[name="question:referral_other"]'),
    ).toHaveCount(0);
    await expect(
      page.locator('input[name="question:referral_source"]'),
    ).toHaveCount(0);

    const dietaryTrigger = page.getByRole("button", {
      name: /Do you have any dietary restrictions\?/,
    });
    await dietaryTrigger.click();
    await page.getByRole("option", { name: "Vegetarian", exact: true }).click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await page
      .getByRole("option", { name: "Gluten-free", exact: true })
      .click();
    await expect(
      page.locator('input[name="question:dietary_restrictions"]'),
    ).toHaveCount(2);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);

    await page.setViewportSize({ width: 1024, height: 768 });
    await referralTrigger.click();
    const scrollRegion = page.locator(
      "section:not([hidden]) [data-registration-scroll]",
    );
    const regionBox = await scrollRegion.boundingBox();
    const menuBox = await page.getByRole("listbox").boundingBox();
    if (!regionBox || !menuBox) {
      throw new Error("Could not measure the dropdown inside its scroll region.");
    }
    expect(menuBox.y).toBeGreaterThanOrEqual(regionBox.y - 1);
    expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(
      regionBox.y + regionBox.height + 1,
    );
    await page.keyboard.press("Escape");

    await page.setViewportSize({ width: 390, height: 844 });
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    const mobileTrigger = await dietaryTrigger.boundingBox();
    if (!mobileTrigger) throw new Error("Could not measure the mobile trigger.");
    expect(mobileTrigger.x).toBeGreaterThanOrEqual(0);
    expect(mobileTrigger.x + mobileTrigger.width).toBeLessThanOrEqual(390);
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
    await expect(currentStep(page)).toHaveText(/Agreements/);
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
