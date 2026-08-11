import { z } from "zod";

// POST /api/payment-methods body — per contracts/settings-api.md. Never
// card fields — only the Moyasar $0 save_only payment id
// CardTokenizationForm's on_completed callback returns.
export const paymentMethodReplaceSchema = z.object({
  moyasarPaymentId: z.string().min(1, "معرف البطاقة غير صالح"),
});

export type PaymentMethodReplaceInput = z.infer<typeof paymentMethodReplaceSchema>;
