import { expect, test } from "@playwright/test";
import { resolveSignupCallback } from "../../../lib/auth/signup-routing";

const event = "/events/sample-event/register";
const retryPath = `/sign-in?next=${encodeURIComponent(event)}&error=oauth`;

test("cancelled sign-in returns to the retry page with the saved destination", async () => {
  const path = await resolveSignupCallback({
    destination: event,
    code: null,
    exchangeCode: async () => {
      throw new Error("a missing code must not be exchanged");
    },
    readAccount: async () => {
      throw new Error("a cancelled sign-in must not read an account");
    },
  });

  expect(path).toBe(retryPath);
});

test("failed code exchange returns to the retry page with the saved destination", async () => {
  const path = await resolveSignupCallback({
    destination: event,
    code: "bad-code",
    exchangeCode: async () => ({ error: new Error("exchange failed") }),
    readAccount: async () => {
      throw new Error("a failed exchange must not read an account");
    },
  });

  expect(path).toBe(retryPath);
});

test("completed profile continues to the saved event destination", async () => {
  const path = await resolveSignupCallback({
    destination: event,
    code: "code",
    exchangeCode: async () => ({ error: null }),
    readAccount: async () => ({ profileComplete: true }),
  });

  expect(path).toBe(event);
});

test("incomplete profile goes to name setup and keeps the destination", async () => {
  const path = await resolveSignupCallback({
    destination: "/members/profile",
    code: "code",
    exchangeCode: async () => ({ error: null }),
    readAccount: async () => ({ profileComplete: false }),
  });

  expect(path).toBe("/profile/setup?next=%2Fmembers%2Fprofile");
});

test("missing account after exchange returns to the retry page", async () => {
  const path = await resolveSignupCallback({
    destination: event,
    code: "code",
    exchangeCode: async () => ({ error: null }),
    readAccount: async () => null,
  });

  expect(path).toBe(retryPath);
});

test("unsafe saved destination falls back to /events", async () => {
  const path = await resolveSignupCallback({
    destination: "//example.org",
    code: null,
    exchangeCode: async () => ({ error: null }),
    readAccount: async () => null,
  });

  expect(path).toBe("/sign-in?next=%2Fevents&error=oauth");
});
