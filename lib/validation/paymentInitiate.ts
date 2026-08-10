import { z } from "zod";

// POST /api/subscriptions/[id]/pay body — per contracts/pay-initiate-api.md.
// Exactly one of moyasarToken / paymentMethodId must be present.
export const paymentInitiateSchema = z
  .object({
    consentGiven: z.literal(true, {
      message: "يجب الموافقة على الشحن المتكرر قبل المتابعة",
    }),
    moyasarToken: z.string().min(1).optional(),
    paymentMethodId: z.string().uuid().optional(),
  })
  .refine((value) => Boolean(value.moyasarToken) !== Boolean(value.paymentMethodId), {
    message: "يجب تحديد بطاقة محفوظة أو إضافة بطاقة جديدة (وليس كلاهما)",
  });

export type PaymentInitiateInput = z.infer<typeof paymentInitiateSchema>;
