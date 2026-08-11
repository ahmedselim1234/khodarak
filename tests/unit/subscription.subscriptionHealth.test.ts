import { describe, expect, it } from "vitest";
import { subscriptionHealth } from "@/lib/subscription/subscriptionHealth";

describe("subscriptionHealth", () => {
  it("is 'good' for an active subscription with no failures and no pending change", () => {
    expect(
      subscriptionHealth({
        status: "active",
        consecutiveFailedPayments: 0,
        hasPendingChangeInsideCutoff: false,
      })
    ).toBe("good");
  });

  it("is 'needs_attention' when there are consecutive failed payments", () => {
    expect(
      subscriptionHealth({
        status: "active",
        consecutiveFailedPayments: 1,
        hasPendingChangeInsideCutoff: false,
      })
    ).toBe("needs_attention");
  });

  it("is 'needs_attention' when a pending change is waiting inside the cutoff window", () => {
    expect(
      subscriptionHealth({
        status: "active",
        consecutiveFailedPayments: 0,
        hasPendingChangeInsideCutoff: true,
      })
    ).toBe("needs_attention");
  });

  it("is 'good' for a paused subscription with no failures", () => {
    expect(
      subscriptionHealth({
        status: "paused",
        consecutiveFailedPayments: 0,
        hasPendingChangeInsideCutoff: false,
      })
    ).toBe("good");
  });

  it("is 'good' for a cancelled subscription regardless of stale failure history", () => {
    expect(
      subscriptionHealth({
        status: "cancelled",
        consecutiveFailedPayments: 2,
        hasPendingChangeInsideCutoff: false,
      })
    ).toBe("good");
  });
});
