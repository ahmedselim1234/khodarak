import { z } from "zod";
import { TIME_SLOT_IDS } from "@/lib/subscription/timeSlots";

export const subscriptionCreateSchema = z.object({
  frequency: z.enum(["weekly", "biweekly", "monthly"], { message: "التردد غير صالح" }),
  addressId: z.string().uuid("العنوان غير صالح"),
  nextDeliveryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "التاريخ غير صالح"),
  deliveryTimeSlot: z.enum(TIME_SLOT_IDS, { message: "وقت التوصيل غير صالح" }),
});

export type SubscriptionCreateInput = z.infer<typeof subscriptionCreateSchema>;
