import { z } from "zod";

const frequencyRuleSchema = z.object({
  enabled: z.boolean(),
  discountPercent: z.number().min(0, "يجب أن تكون النسبة بين 0 و100").max(100, "يجب أن تكون النسبة بين 0 و100"),
  deliveriesPerMonth: z.number().int().min(1, "يجب أن يكون عدد التوصيلات 1 على الأقل"),
});

const frequenciesSchema = z.object({
  weekly: frequencyRuleSchema,
  biweekly: frequencyRuleSchema,
  monthly: frequencyRuleSchema,
});

// Settings update payload — every numeric field range-checked to match the
// database's own `check` constraints (data-model.md, contracts/settings-admin-api.md).
export const settingsUpdateSchema = z
  .object({
    frequencies: frequenciesSchema.partial().optional(),
    minOrderValue: z.number().min(0, "يجب ألا تكون القيمة سالبة").optional(),
    maxItemsPerBox: z.number().int().min(1, "يجب أن يكون العدد 1 على الأقل").optional(),
    editCutoffHours: z.number().int().min(0, "يجب ألا تكون القيمة سالبة").optional(),
    firstDeliveryLeadDays: z.number().int().min(0, "يجب ألا تكون القيمة سالبة").optional(),
    blackoutWeekdays: z.array(z.number().int().min(0).max(6, "يوم غير صالح")).optional(),
    deliveryMode: z.enum(["flat", "free_above_threshold", "per_city"], {
      message: "نمط التوصيل غير صالح",
    }).optional(),
    deliveryFlatFee: z.number().min(0, "يجب ألا تكون القيمة سالبة").optional(),
    deliveryFreeThreshold: z.number().min(0, "يجب ألا تكون القيمة سالبة").optional(),
    maxPauseDays: z.number().int().min(0, "يجب ألا تكون القيمة سالبة").optional(),
    maxPausesPerYear: z.number().int().min(0, "يجب ألا تكون القيمة سالبة").optional(),
    vatPercent: z.number().min(0, "يجب أن تكون النسبة بين 0 و100").max(100, "يجب أن تكون النسبة بين 0 و100").optional(),
    pricesIncludeVat: z.boolean().optional(),
    roundingMode: z.enum(["none", "nearest_0.5", "nearest_1"], {
      message: "طريقة التقريب غير صالحة",
    }).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "لا يوجد ما يتم تحديثه",
  });

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
