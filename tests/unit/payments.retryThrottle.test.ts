import { describe, expect, it } from "vitest";
import { isThrottled } from "@/lib/payments/retryThrottle";

const NOW = new Date("2026-08-11T12:00:00Z");
const opts = { maxAttempts: 5, windowMinutes: 15 };

function minutesAgo(minutes: number): string {
  return new Date(NOW.getTime() - minutes * 60_000).toISOString();
}

describe("isThrottled", () => {
  it("is not throttled under the failure threshold", () => {
    const recent = [minutesAgo(1), minutesAgo(2), minutesAgo(3)];
    expect(isThrottled(recent, NOW, opts)).toBe(false);
  });

  it("is throttled at the failure threshold", () => {
    const recent = [minutesAgo(1), minutesAgo(2), minutesAgo(3), minutesAgo(4), minutesAgo(5)];
    expect(isThrottled(recent, NOW, opts)).toBe(true);
  });

  it("is not throttled when enough failures happened outside the trailing window", () => {
    // 5 failures, but all outside the 15-minute window.
    const recent = [
      minutesAgo(20),
      minutesAgo(25),
      minutesAgo(30),
      minutesAgo(35),
      minutesAgo(40),
    ];
    expect(isThrottled(recent, NOW, opts)).toBe(false);
  });

  it("counts only failures inside the window, ignoring older ones", () => {
    const recent = [minutesAgo(1), minutesAgo(2), minutesAgo(3), minutesAgo(4), minutesAgo(30)];
    expect(isThrottled(recent, NOW, opts)).toBe(false);
  });

  it("returns false for an empty history", () => {
    expect(isThrottled([], NOW, opts)).toBe(false);
  });
});
