import { z } from "zod";

// Photo format/size limits enforced client-side before upload (T008) and
// referenced here for the shared constants — the server schema below only
// validates that imageUrl is present, since the actual file never reaches
// the Route Handler (research.md §3: browser uploads directly to Storage).
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export const productCreateSchema = z
  .object({
    nameAr: z.string().min(1, "اسم المنتج مطلوب"),
    category: z.enum(["vegetables", "fruits"], {
      message: "الفئة غير صالحة",
    }),
    price: z.number().positive("السعر يجب أن يكون أكبر من صفر"),
    unit: z.enum(["kg", "piece"], { message: "الوحدة غير صالحة" }),
    imageUrl: z.string().min(1, "الصورة مطلوبة"),
    minQty: z.number().int().min(1, "الحد الأدنى للكمية يجب أن يكون 1 على الأقل"),
    maxQty: z.number().int().min(1, "الحد الأقصى للكمية يجب أن يكون 1 على الأقل"),
  })
  .refine((value) => value.maxQty >= value.minQty, {
    message: "الحد الأقصى يجب أن يكون أكبر من أو يساوي الحد الأدنى",
    path: ["maxQty"],
  });

export type ProductCreateInput = z.infer<typeof productCreateSchema>;

export const productUpdateSchema = z
  .object({
    nameAr: z.string().min(1, "اسم المنتج مطلوب").optional(),
    category: z.enum(["vegetables", "fruits"], { message: "الفئة غير صالحة" }).optional(),
    price: z.number().positive("السعر يجب أن يكون أكبر من صفر").optional(),
    unit: z.enum(["kg", "piece"], { message: "الوحدة غير صالحة" }).optional(),
    imageUrl: z.string().min(1, "الصورة مطلوبة").optional(),
    isAvailable: z.boolean().optional(),
    minQty: z.number().int().min(1).optional(),
    maxQty: z.number().int().min(1).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "لا يوجد ما يتم تحديثه",
  })
  .refine(
    (value) =>
      value.minQty === undefined || value.maxQty === undefined || value.maxQty >= value.minQty,
    {
      message: "الحد الأقصى يجب أن يكون أكبر من أو يساوي الحد الأدنى",
      path: ["maxQty"],
    }
  );

export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
