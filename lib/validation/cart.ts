import { z } from "zod";

export const cartItemUpsertSchema = z.object({
  quantity: z.number().int().min(0, "الكمية غير صالحة"),
});

export type CartItemUpsertInput = z.infer<typeof cartItemUpsertSchema>;

export const cartMergeSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid("معرف المنتج غير صالح"),
      quantity: z.number().int().min(0, "الكمية غير صالحة"),
    })
  ),
});

export type CartMergeInput = z.infer<typeof cartMergeSchema>;
