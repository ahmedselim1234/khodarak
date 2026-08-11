// Presentational — renders subscriptionHealth.ts's 'good' | 'needs_attention'
// output as the bento layout's health indicator (spec.md Clarification 1: a
// small set of plain states, not a numeric score).
export function SubscriptionHealthBadge({ health }: { health: "good" | "needs_attention" }) {
  if (health === "needs_attention") {
    return (
      <span className="inline-flex items-center gap-1 bg-error/10 text-error px-3 py-1 rounded-full text-label-sm font-bold">
        <span className="material-symbols-outlined text-[16px]">warning</span>
        يحتاج انتباه
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-label-sm font-bold">
      <span className="material-symbols-outlined text-[16px]">check_circle</span>
      بحالة جيدة
    </span>
  );
}
