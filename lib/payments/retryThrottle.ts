// FR-016a: after a small number of consecutive failed payment attempts for
// the same subscription within a trailing window, further attempts are
// throttled — mirrors the login-throttling precedent from Phase 1, applied
// to this app's own /pay endpoint rather than relying on Moyasar's
// platform-wide fraud tooling to cover a per-endpoint abuse pattern it
// doesn't know about (research.md §6).
export type ThrottleOptions = {
  maxAttempts: number;
  windowMinutes: number;
};

export function isThrottled(
  recentFailedAttemptTimestamps: string[],
  now: Date,
  options: ThrottleOptions
): boolean {
  const windowStart = now.getTime() - options.windowMinutes * 60_000;

  const countInWindow = recentFailedAttemptTimestamps.filter(
    (timestamp) => new Date(timestamp).getTime() >= windowStart
  ).length;

  return countInWindow >= options.maxAttempts;
}
