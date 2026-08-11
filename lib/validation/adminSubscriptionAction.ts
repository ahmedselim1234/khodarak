import { z } from "zod";

// POST /api/admin/subscriptions/[id]/{pause,cancel} body — per
// contracts/admin-subscriptions-api.md. Reason required for both,
// distinguishing an admin-initiated action from a customer's own
// (Clarification session, FR-007/008).
export const adminSubscriptionPauseSchema = z.object({
  reason: z.string().trim().min(1, "السبب مطلوب"),
  resumeDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "التاريخ غير صالح")
    .optional()
    .nullable(),
});

export type AdminSubscriptionPauseInput = z.infer<typeof adminSubscriptionPauseSchema>;

export const adminSubscriptionCancelSchema = z.object({
  reason: z.string().trim().min(1, "السبب مطلوب"),
});

export type AdminSubscriptionCancelInput = z.infer<typeof adminSubscriptionCancelSchema>;
