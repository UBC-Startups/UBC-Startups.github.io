import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/auth",
  workers: 1,
  reporter: "list",
});
