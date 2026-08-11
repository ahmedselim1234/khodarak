import { z } from "zod";

// PATCH /api/subscriptions/[id] body — per
// contracts/subscription-detail-and-edit-api.md. All three fields required
// together: a full replace of the box's configuration, not a partial patch.
export const subscriptionEditSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid("معرف المنتج غير صالح"),
        quantity: z.number().int().min(1, "الكمية غير صالحة"),
      })
    )
    .min(1, "يجب اختيار منتج واحد على الأقل"),
  frequency: z.enum(["weekly", "biweekly", "monthly"], { message: "التردد غير صالح" }),
  addressId: z.string().uuid("العنوان غير صالح"),
});

export type SubscriptionEditInput = z.infer<typeof subscriptionEditSchema>;
