import { z } from "zod";

export const deliveryIntervalCreateSchema = z.object({
  days: z.number().int().min(1, "عدد الأيام غير صالح").max(90, "عدد الأيام غير صالح"),
  discountPercent: z.number().min(0, "نسبة الخصم غير صالحة").max(100, "نسبة الخصم غير صالحة"),
});

export type DeliveryIntervalCreateInput = z.infer<typeof deliveryIntervalCreateSchema>;

export const deliveryIntervalUpdateSchema = z
  .object({
    discountPercent: z.number().min(0, "نسبة الخصم غير صالحة").max(100, "نسبة الخصم غير صالحة").optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "لا يوجد ما يتم تحديثه" });

export type DeliveryIntervalUpdateInput = z.infer<typeof deliveryIntervalUpdateSchema>;
