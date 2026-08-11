import { describe, expect, it } from "vitest";
import { nextRetryOrSuspend } from "@/lib/payments/dunningSchedule";

const FIRST_FAILURE = new Date("2026-08-11T10:00:00Z");

describe("nextRetryOrSuspend", () => {
  it("schedules the first retry 1 day after the original failure", () => {
    const result = nextRetryOrSuspend(1, FIRST_FAILURE);
    expect(result).toEqual({ action: "retry", retryAt: new Date("2026-08-12T10:00:00Z") });
  });

  it("schedules the second retry 3 days after the original failure, not the first retry", () => {
    const result = nextRetryOrSuspend(2, FIRST_FAILURE);
    expect(result).toEqual({ action: "retry", retryAt: new Date("2026-08-14T10:00:00Z") });
  });

  it("schedules the third retry 5 days after the original failure", () => {
    const result = nextRetryOrSuspend(3, FIRST_FAILURE);
    expect(result).toEqual({ action: "retry", retryAt: new Date("2026-08-16T10:00:00Z") });
  });

  it("suspends once the third retry also fails (attempt count 4)", () => {
    expect(nextRetryOrSuspend(4, FIRST_FAILURE)).toEqual({ action: "suspend" });
  });

  it("suspends for any attempt count beyond the schedule, not just exactly 4", () => {
    expect(nextRetryOrSuspend(5, FIRST_FAILURE)).toEqual({ action: "suspend" });
  });
});
