export type OrderStatus = "pending" | "out_for_delivery" | "delivered" | "cancelled";

// FR-003 / data-model.md's state diagram: a strict, enforced forward
// progression only. No transition exists from 'delivered' (terminal), no
// backward move, no skip, and cancellation is only reachable from 'pending'
// or 'out_for_delivery'.
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export function isValidOrderStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
