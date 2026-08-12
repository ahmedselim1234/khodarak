import { z } from "zod";
import { TIME_SLOT_IDS } from "@/lib/subscription/timeSlots";

// FR-005: a new subscription only ever uses the admin-configured interval
// list — no legacy named frequency is accepted for creation going forward
// (Phase 10, contracts/subscription-interval-integration.md).
export const subscriptionCreateSchema = z.object({
  deliveryIntervalId: z.string().uuid("الفاصل الزمني غير صالح"),
  addressId: z.string().uuid("العنوان غير صالح"),
  nextDeliveryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "التاريخ غير صالح"),
  deliveryTimeSlot: z.enum(TIME_SLOT_IDS, { message: "وقت التوصيل غير صالح" }),
});

export type SubscriptionCreateInput = z.infer<typeof subscriptionCreateSchema>;
