import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100",
    // The app has scroll-triggered entrance animations and several ambient
    // loops (hero gradient pan, marquee, skeleton shimmer). Without this,
    // `toBeVisible()` can race a reveal that is still mid-fade, and any
    // screenshot comparison is non-deterministic. Forcing reduced motion also
    // means CI continuously exercises the reduced-motion code path — where the
    // real risk is content that is never revealed at all.
    // Nested under contextOptions: in this Playwright version `reducedMotion`
    // is a browser-context option, not a top-level test option.
    contextOptions: { reducedMotion: "reduce" },
  },
});
