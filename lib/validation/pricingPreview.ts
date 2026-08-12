import { z } from "zod";

export const pricingPreviewRequestSchema = z
  .object({
    items: z.array(
      z.object({
        productId: z.string().uuid("معرف المنتج غير صالح"),
        quantity: z.number().int().min(1, "الكمية غير صالحة"),
      })
    ),
    frequency: z.enum(["weekly", "biweekly", "monthly"], { message: "التردد غير صالح" }).optional(),
    deliveryIntervalId: z.string().uuid("الفاصل الزمني غير صالح").optional(),
    cityId: z.string().uuid("المدينة غير صالحة"),
  })
  .refine((value) => Boolean(value.frequency) !== Boolean(value.deliveryIntervalId), {
    message: "يجب تحديد التردد أو الفاصل الزمني، وليس كلاهما",
    path: ["frequency"],
  });

export type PricingPreviewRequestInput = z.infer<typeof pricingPreviewRequestSchema>;
