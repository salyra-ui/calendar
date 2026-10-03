import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "*.browser.spec.ts",
  workers: 1,
  use: { headless: true, baseURL: "http://127.0.0.1:4330" },
  webServer: [
    {
      command: "npm run dev",
      url: "http://127.0.0.1:4330",
      reuseExistingServer: true,
    },
    {
      command: "npm run dev:astro",
      url: "http://127.0.0.1:4331",
      env: { ASTRO_DEV_BACKGROUND: "1" },
      reuseExistingServer: true,
    },
  ],
  reporter: "list",
});
