import { z } from "zod";

export const pricingPreviewRequestSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid("معرف المنتج غير صالح"),
      quantity: z.number().int().min(1, "الكمية غير صالحة"),
    })
  ),
  frequency: z.enum(["weekly", "biweekly", "monthly"], { message: "التردد غير صالح" }),
  cityId: z.string().uuid("المدينة غير صالحة"),
});

export type PricingPreviewRequestInput = z.infer<typeof pricingPreviewRequestSchema>;
