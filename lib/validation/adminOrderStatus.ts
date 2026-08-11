import { z } from "zod";

// PATCH /api/admin/orders/[id] body — per contracts/admin-orders-api.md. An
// admin never sets 'pending' — that's only ever the order's own
// creation-time default (Phase 5/7).
export const adminOrderStatusSchema = z.object({
  status: z.enum(["out_for_delivery", "delivered", "cancelled"], {
    message: "الحالة غير صالحة",
  }),
});

export type AdminOrderStatusInput = z.infer<typeof adminOrderStatusSchema>;
