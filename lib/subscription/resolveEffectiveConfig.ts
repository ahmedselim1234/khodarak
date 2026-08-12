export type SubscriptionConfig = {
  frequency: "weekly" | "biweekly" | "monthly" | "custom_interval";
  // Present iff frequency === "custom_interval" (Phase 10, research.md §1).
  deliveryIntervalId?: string | null;
  deliveryIntervalDays?: number | null;
  addressId: string;
  items: Array<{ productId: string; quantity: number }>;
  priceBreakdown: unknown;
};

export type PendingSubscriptionConfig = SubscriptionConfig & { effectiveFrom: string };

export type ResolveEffectiveConfigInput = {
  now: Date;
  nextDeliveryDate: string; // ISO date (YYYY-MM-DD)
  current: SubscriptionConfig;
  pending: PendingSubscriptionConfig | null;
};

export type ResolveEffectiveConfigResult = {
  locked: SubscriptionConfig;
  pendingChange: PendingSubscriptionConfig | null;
};

// research.md §1 / spec.md Clarification 3: a deferred edit never overwrites
// the subscription's current fields — it's stored separately as `pending`.
// This is a read-time resolver only, never a mutation. Once `now` reaches
// `nextDeliveryDate`, the locked delivery itself has passed, so the pending
// configuration is what's now in effect (and there is nothing further
// "pending" to show) — the actual DB promotion of pending → current fields
// is Phase 7's renewal-engine job, not this function's (research.md §1).
export function resolveEffectiveConfig(
  input: ResolveEffectiveConfigInput
): ResolveEffectiveConfigResult {
  const { now, nextDeliveryDate, current, pending } = input;

  if (!pending) {
    return { locked: current, pendingChange: null };
  }

  const nextDelivery = new Date(`${nextDeliveryDate}T00:00:00Z`);
  const stillLocked = now.getTime() < nextDelivery.getTime();

  if (stillLocked) {
    return { locked: current, pendingChange: pending };
  }

  return {
    locked: {
      frequency: pending.frequency,
      deliveryIntervalId: pending.deliveryIntervalId,
      deliveryIntervalDays: pending.deliveryIntervalDays,
      addressId: pending.addressId,
      items: pending.items,
      priceBreakdown: pending.priceBreakdown,
    },
    pendingChange: null,
  };
}
