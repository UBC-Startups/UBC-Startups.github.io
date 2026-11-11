import { defineConfig } from "@playwright/test";
import {
  assertLoopback,
  eventSignupBaseUrl,
  readLocalSupabaseConfig,
} from "./tests/event-signup/fixtures/local-supabase";

// Opt-in local-Supabase acceptance suite. It is intentionally separate from
// playwright.config.ts, the browser-free unit suite, and CI.
const local = readLocalSupabaseConfig();
const appUrl = assertLoopback(eventSignupBaseUrl, "EVENT_SIGNUP_BASE_URL");
const hostname = appUrl.hostname.replace(/^\[|\]$/g, "");
const port = appUrl.port || "3101";

export default defineConfig({
  testDir: "./tests/event-signup",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: eventSignupBaseUrl,
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        browserName: "chromium",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile",
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- --hostname ${hostname} --port ${port}`,
    url: eventSignupBaseUrl,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      APP_ORIGIN: eventSignupBaseUrl,
      NEXT_PUBLIC_SUPABASE_URL: local.url,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: local.publishableKey,
      SUPABASE_SECRET_KEY: local.serviceKey,
    },
  },
});
