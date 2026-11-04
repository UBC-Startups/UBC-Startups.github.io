import { expect, test } from "@playwright/test";

test("sign-in keeps the event destination through a retry", async ({ page }) => {
  await page.goto("/sign-in?next=%2Fevents%2Fsample-event%2Fregister&error=oauth");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.getByText("Sign-in could not be completed. Please try again.")).toContainText("Please try again");
  await expect(page.locator('input[name="next"]')).toHaveValue("/events/sample-event/register");
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
});

test("sign-in rejects external destinations", async ({ page }) => {
  await page.goto("/sign-in?next=%2F%2Fexample.org");
  await expect(page.locator('input[name="next"]')).toHaveValue("/events");
});

test("signed-out profile setup returns to sign-in with the event destination", async ({ page }) => {
  await page.goto("/profile/setup?next=%2Fevents%2Fsample-event%2Fregister");
  await expect(page).toHaveURL(/\/sign-in\?next=/);
  await expect(page.locator('input[name="next"]')).toHaveValue("/events/sample-event/register");
});
