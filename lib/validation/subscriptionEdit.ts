import { z } from "zod";

// PATCH /api/subscriptions/[id] body — per
// contracts/subscription-detail-and-edit-api.md, extended by Phase 10
// (research.md §6): a full replace of items/address, plus exactly one of
// `frequency` (resubmit the current legacy value, unchanged — never a way
// to switch back to it once already interval-based) or `deliveryIntervalId`
// (the only way to actually change the delivery cadence).
export const subscriptionEditSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z.string().uuid("معرف المنتج غير صالح"),
          quantity: z.number().int().min(1, "الكمية غير صالحة"),
        })
      )
      .min(1, "يجب اختيار منتج واحد على الأقل"),
    frequency: z.enum(["weekly", "biweekly", "monthly"], { message: "التردد غير صالح" }).optional(),
    deliveryIntervalId: z.string().uuid("الفاصل الزمني غير صالح").optional(),
    addressId: z.string().uuid("العنوان غير صالح"),
  })
  .refine((value) => Boolean(value.frequency) !== Boolean(value.deliveryIntervalId), {
    message: "يجب تحديد التردد أو الفاصل الزمني، وليس كلاهما",
    path: ["frequency"],
  });

export type SubscriptionEditInput = z.infer<typeof subscriptionEditSchema>;
