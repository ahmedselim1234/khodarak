export type PauseEligibilityInput = {
  now: Date;
  resumeDate: string; // ISO date
  pastPauses: Array<{ startedAt: string }>;
  maxPauseDays: number;
  maxPausesPerYear: number;
};

export type PauseEligibilityResult =
  | { allowed: true }
  | { allowed: false; limit: "max_pause_days" | "max_pauses_per_year" };

const ROLLING_WINDOW_MS = 365 * 24 * 60 * 60 * 1000;

// research.md §2 / spec.md Clarification 2: a rolling 365-day window,
// counted back from `now` — not a fixed calendar year. Duration is checked
// first since it's the more specific, cheaper-to-explain failure.
export function pauseEligibility(input: PauseEligibilityInput): PauseEligibilityResult {
  const { now, resumeDate, pastPauses, maxPauseDays, maxPausesPerYear } = input;

  const resume = new Date(`${resumeDate}T00:00:00Z`);
  const pauseDurationDays = Math.ceil((resume.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

  if (pauseDurationDays > maxPauseDays) {
    return { allowed: false, limit: "max_pause_days" };
  }

  const windowStart = now.getTime() - ROLLING_WINDOW_MS;
  const pausesInWindow = pastPauses.filter(
    (pause) => new Date(pause.startedAt).getTime() >= windowStart
  ).length;

  if (pausesInWindow >= maxPausesPerYear) {
    return { allowed: false, limit: "max_pauses_per_year" };
  }

  return { allowed: true };
}
