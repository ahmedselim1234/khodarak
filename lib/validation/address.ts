import { z } from "zod";

export const addressCreateSchema = z.object({
  label: z.string().min(1, "التسمية مطلوبة"),
  cityId: z.string().uuid("المدينة غير صالحة"),
  district: z.string().min(1, "الحي مطلوب"),
  streetDetails: z.string().min(1, "تفاصيل الشارع مطلوبة"),
});

export type AddressCreateInput = z.infer<typeof addressCreateSchema>;

export const addressUpdateSchema = z
  .object({
    label: z.string().min(1, "التسمية مطلوبة").optional(),
    cityId: z.string().uuid("المدينة غير صالحة").optional(),
    district: z.string().min(1, "الحي مطلوب").optional(),
    streetDetails: z.string().min(1, "تفاصيل الشارع مطلوبة").optional(),
    // FR-014: an address cannot be explicitly un-defaulted to false — only
    // setting a *different* address as default removes this one's flag.
    isDefault: z.literal(true).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "لا يوجد ما يتم تحديثه",
  });

export type AddressUpdateInput = z.infer<typeof addressUpdateSchema>;
