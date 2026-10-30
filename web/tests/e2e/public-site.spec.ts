import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Never submit real newsletter requests or load analytics/social embeds in tests.
  await page.route(/assets\.mailerlite\.com|googletagmanager\.com|google-analytics\.com|instagram\.com|linkedin\.com/, route => route.fulfill({ status: 200, contentType: "text/html", body: "" }));
});

const routes = [
  ["/", "UBC Startups"],
  ["/events", "Events | UBC Startups"],
  ["/meetOurTeam", "Team | UBC Startups"],
  ["/event-poster/soar-2026", "SOAR 2026 | UBC Startups"],
  ["/event-poster/foundher-2026", "Founder’s Circle: UBC Startups Kickoff | UBC Startups"],
  ["/event-poster/innovation-olympics-2025", "The Crisis Room Challenge | UBC Startups"],
  ["/event-poster/startup-games-2026", "The Startup Games | UBC Startups"],
];

for (const [path, title] of routes) {
  test(`direct link, refresh, assets, and layout: ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(title);
    await expect(page.locator("main")).toHaveCount(1);
    await page.locator("main").waitFor();
    await page.evaluate(() => document.querySelectorAll("img").forEach(image => { image.loading = "eager"; }));
    await expect.poll(() => page.evaluate(() => [...document.images].filter(image => image.src.startsWith(location.origin) && (!image.complete || image.naturalWidth === 0)).map(image => image.getAttribute("src")))).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.reload();
    await expect(page).toHaveTitle(title);
    expect(errors).toEqual([]);
  });
}

test("navigation and cross-page hash links", async ({ page }, testInfo) => {
  const clickSection = async (name: string) => {
    if (testInfo.project.name === "mobile") {
      await page.getByRole("button", { name: "Menu", exact: true }).click();
      await expect(page.getByRole("button", { name: "Close", exact: true })).toHaveAttribute("aria-expanded", "true");
      await page.locator("#home-mobile-menu").getByRole("link", { name, exact: true }).click();
    } else {
      await page.getByRole("navigation", { name: "Main", exact: true }).getByRole("link", { name, exact: true }).click();
    }
  };

  await page.goto("/meetOurTeam");
  // Cover both a cold destination and revisiting it from the client router cache.
  for (let visit = 0; visit < 2; visit++) {
    await clickSection("About Us");
    await expect(page).toHaveURL(/\/#aboutUs$/);
    await expect(page.locator("#aboutUs")).toBeInViewport();
    await clickSection("FAQ");
    await expect(page).toHaveURL(/\/#faq$/);
    await expect(page.locator("#faq")).toBeInViewport();
    await page.getByRole("link", { name: "Upcoming Events", exact: true }).click();
    await expect(page).toHaveURL(/\/events$/);
    await expect(page.getByText("Sign up details coming soon", { exact: true })).toBeVisible();
  }
  await page.goto("/events#pitch-propel");
  await expect(page.locator("#pitch-propel")).toBeInViewport();
});

test("homepage section direct links and refresh scroll to the destination", async ({ page }) => {
  for (const id of ["aboutUs", "faq"]) {
    await page.goto(`/#${id}`);
    await expect(page.locator(`#${id}`)).toBeInViewport();
    await page.reload();
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
});

test("FAQ, carousel, and newsletter keep working", async ({ page }) => {
  await page.goto("/#faq");
  const first = page.locator("#faq-q-0");
  await expect(first).toHaveAttribute("aria-expanded", "true");
  await first.click();
  await expect(first).toHaveAttribute("aria-expanded", "false");
  const second = page.locator("#faq-q-1");
  await second.click();
  await expect(second).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#faq-a-1")).toBeVisible();
  const photo = page.getByRole("button", { name: "Next photo", exact: true });
  await photo.click();
  await expect(page.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true");
  await page.getByRole("textbox", { name: "Email address" }).fill("migration-test@example.com");
  const subscription = page.waitForRequest(request => request.method() === "POST" && request.url().includes("assets.mailerlite.com/jsonp/"));
  await page.getByRole("button", { name: "Subscribe", exact: true }).click();
  const payload = new URLSearchParams((await subscription).postData() ?? "");
  expect(payload.get("fields[email]")).toBe("migration-test@example.com");
  expect(payload.get("ml-submit")).toBe("1");
  expect(payload.get("anticsrf")).toBe("true");
  await expect(page.getByText("Thanks — you're on the list!", { exact: true })).toBeVisible();
});

test("poster back link and SOAR controls", async ({ page }, testInfo) => {
  await page.goto("/event-poster/foundher-2026");
  await page.getByRole("link", { name: "Back to Events" }).click();
  await expect(page).toHaveURL(/\/events$/);
  await page.goto("/event-poster/soar-2026");
  await page.getByRole("button", { name: "Next SOAR photo" }).click();
  await expect(page.getByRole("img", { name: "SOAR event photo 2 of 5" })).toBeVisible();
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await page.locator("#poster-mobile-menu").getByRole("link", { name: "Team", exact: true }).click();
    await expect(page).toHaveURL(/\/meetOurTeam$/);
  }
});

test("unknown pages and event IDs show not-found content and prevent indexing", async ({ page }) => {
  for (const path of ["/missing-page", "/event-poster/does-not-exist"]) {
    const response = await page.goto(path);
    // Next.js returns 200 for streamed notFound() responses and adds noindex.
    expect([200, 404]).toContain(response?.status());
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
  }
});

test.describe("server-rendered content", () => {
  test.use({ javaScriptEnabled: false });

  test("homepage introduction emits opaque stationary styles before hydration", async ({ page }) => {
    await page.goto("/");
    const title = page.locator("#hero-title");
    // Next may stage streamed HTML in a hidden container until hydration.
    // Verify the hero's own SSR styles, independently of that transport.
    await expect(title).toBeAttached();
    await expect(title).toHaveCSS("opacity", "1");
    await expect(title).toHaveCSS("transform", "none");
    const introduction = page.getByText("Building a Startup Ecosystem on Campus", { exact: true });
    await expect(introduction).toBeAttached();
    await expect(introduction).toHaveCSS("opacity", "1");
    await expect(introduction).toHaveCSS("transform", "none");
  });
});
