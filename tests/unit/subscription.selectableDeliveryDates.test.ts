import { describe, expect, it } from "vitest";
import { selectableDeliveryDates, isDateSelectable } from "@/lib/subscription/selectableDeliveryDates";

// Wednesday, 2026-08-12 — a fixed reference "today" so tests don't depend on
// the actual calendar date.
const TODAY = new Date("2026-08-12T00:00:00Z");

describe("selectableDeliveryDates", () => {
  it("excludes dates before the lead time", () => {
    // leadDays: 3 means the earliest selectable date is today + 3 days.
    const dates = selectableDeliveryDates(TODAY, { leadDays: 3, blackoutWeekdays: [], horizonDays: 10 });
    const earliest = dates[0];
    const expectedEarliest = new Date(TODAY);
    expectedEarliest.setUTCDate(expectedEarliest.getUTCDate() + 3);
    expect(earliest).toBe(expectedEarliest.toISOString().slice(0, 10));
  });

  it("includes the date exactly at the lead-time boundary", () => {
    const dates = selectableDeliveryDates(TODAY, { leadDays: 2, blackoutWeekdays: [], horizonDays: 5 });
    const boundary = new Date(TODAY);
    boundary.setUTCDate(boundary.getUTCDate() + 2);
    expect(dates).toContain(boundary.toISOString().slice(0, 10));
  });

  it("excludes blackout weekdays", () => {
    // Friday = 5. 2026-08-14 is a Friday.
    const dates = selectableDeliveryDates(TODAY, { leadDays: 1, blackoutWeekdays: [5], horizonDays: 10 });
    expect(dates).not.toContain("2026-08-14");
  });

  it("includes an ordinary valid date (not before lead time, not a blackout day)", () => {
    const dates = selectableDeliveryDates(TODAY, { leadDays: 1, blackoutWeekdays: [5], horizonDays: 10 });
    expect(dates).toContain("2026-08-13");
  });

  it("combines lead-time and blackout rules correctly", () => {
    // leadDays: 5 pushes the earliest to 2026-08-17 (Monday). Blackout
    // Monday(1) and Friday(5) should remove 08-17 and any Friday in range.
    const dates = selectableDeliveryDates(TODAY, {
      leadDays: 5,
      blackoutWeekdays: [1, 5],
      horizonDays: 14,
    });
    expect(dates).not.toContain("2026-08-17"); // Monday, blacked out
    expect(dates).not.toContain("2026-08-14"); // Friday, before lead time anyway
    expect(dates).not.toContain("2026-08-21"); // Friday, blacked out
    expect(dates).toContain("2026-08-18"); // Tuesday, valid
  });
});

describe("isDateSelectable", () => {
  it("returns false for a date before the lead time", () => {
    expect(isDateSelectable("2026-08-13", TODAY, { leadDays: 3, blackoutWeekdays: [] })).toBe(false);
  });

  it("returns true for a date exactly at the lead-time boundary", () => {
    expect(isDateSelectable("2026-08-15", TODAY, { leadDays: 3, blackoutWeekdays: [] })).toBe(true);
  });

  it("returns false for a blackout weekday even past the lead time", () => {
    expect(isDateSelectable("2026-08-14", TODAY, { leadDays: 1, blackoutWeekdays: [5] })).toBe(false);
  });

  it("returns true for a valid, non-blackout date past the lead time", () => {
    expect(isDateSelectable("2026-08-13", TODAY, { leadDays: 1, blackoutWeekdays: [5] })).toBe(true);
  });
});
