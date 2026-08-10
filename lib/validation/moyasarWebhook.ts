import { z } from "zod";

// Webhook payload shape — a defensive layer behind signature verification
// (lib/payments/verifyWebhookSignature.ts), not a substitute for it.
export const moyasarWebhookSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  data: z.object({
    id: z.string().min(1),
    status: z.string().min(1),
  }),
});

export type MoyasarWebhookInput = z.infer<typeof moyasarWebhookSchema>;
