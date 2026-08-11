import { describe, expect, it } from "vitest";
import { pauseEligibility } from "@/lib/subscription/pauseEligibility";

const NOW = new Date("2026-08-11T00:00:00Z");

describe("pauseEligibility", () => {
  it("allows a pause under both limits", () => {
    const result = pauseEligibility({
      now: NOW,
      resumeDate: "2026-08-25", // 14 days
      pastPauses: [],
      maxPauseDays: 30,
      maxPausesPerYear: 4,
    });
    expect(result).toEqual({ allowed: true });
  });

  it("denies a pause exceeding max_pause_days", () => {
    const result = pauseEligibility({
      now: NOW,
      resumeDate: "2026-09-20", // 40 days
      pastPauses: [],
      maxPauseDays: 30,
      maxPausesPerYear: 4,
    });
    expect(result).toEqual({ allowed: false, limit: "max_pause_days" });
  });

  it("denies a pause at max_pauses_per_year within the rolling 365-day window", () => {
    const pastPauses = [
      { startedAt: "2026-06-01T00:00:00Z" },
      { startedAt: "2026-03-01T00:00:00Z" },
      { startedAt: "2025-12-01T00:00:00Z" },
      { startedAt: "2025-09-01T00:00:00Z" },
    ];
    const result = pauseEligibility({
      now: NOW,
      resumeDate: "2026-08-20",
      pastPauses,
      maxPauseDays: 30,
      maxPausesPerYear: 4,
    });
    expect(result).toEqual({ allowed: false, limit: "max_pauses_per_year" });
  });

  it("does not count a pause older than 365 days against the limit", () => {
    const pastPauses = [
      { startedAt: "2026-06-01T00:00:00Z" },
      { startedAt: "2026-03-01T00:00:00Z" },
      { startedAt: "2025-12-01T00:00:00Z" },
      { startedAt: "2025-01-01T00:00:00Z" }, // more than 365 days before NOW
    ];
    const result = pauseEligibility({
      now: NOW,
      resumeDate: "2026-08-20",
      pastPauses,
      maxPauseDays: 30,
      maxPausesPerYear: 4,
    });
    expect(result).toEqual({ allowed: true });
  });
});
