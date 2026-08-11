import { z } from "zod";

// POST /api/subscriptions/[id]/pause body — per
// contracts/pause-resume-cancel-api.md. resumeDate must be a future date;
// the exact max-duration check is pauseEligibility.ts's job (rule
// validation, not shape validation), not this schema's.
export const subscriptionPauseSchema = z.object({
  resumeDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "التاريخ غير صالح")
    .refine((value) => {
      const today = new Date().toISOString().slice(0, 10);
      return value > today;
    }, "يجب أن يكون تاريخ الاستئناف في المستقبل"),
});

export type SubscriptionPauseInput = z.infer<typeof subscriptionPauseSchema>;

// POST /api/subscriptions/[id]/cancel body.
export const subscriptionCancelSchema = z.object({
  confirm: z.literal(true, { message: "يجب تأكيد الإلغاء" }),
});

export type SubscriptionCancelInput = z.infer<typeof subscriptionCancelSchema>;
