import { z } from "zod";

export const cityCreateSchema = z.object({
  nameAr: z.string().min(1, "اسم المدينة مطلوب"),
  isActive: z.boolean().optional().default(true),
  deliveryFeeOverride: z.number().min(0, "رسوم التوصيل غير صالحة").optional().nullable(),
});

export type CityCreateInput = z.infer<typeof cityCreateSchema>;

export const cityUpdateSchema = z
  .object({
    nameAr: z.string().min(1, "اسم المدينة مطلوب").optional(),
    isActive: z.boolean().optional(),
    deliveryFeeOverride: z.number().min(0, "رسوم التوصيل غير صالحة").optional().nullable(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "لا يوجد ما يتم تحديثه" });

export type CityUpdateInput = z.infer<typeof cityUpdateSchema>;
