import { z } from "zod";
import { phoneSchema } from "@/lib/validation/auth";

// PATCH /api/profile body — per contracts/settings-api.md. Reuses Phase 1's
// KSA phone-format rule (lib/validation/auth.ts's phoneSchema).
export const profileUpdateSchema = z.object({
  fullName: z.string().min(1, "الاسم مطلوب"),
  phone: phoneSchema,
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
