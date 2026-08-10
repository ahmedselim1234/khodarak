import { z } from "zod";

// KSA mobile number, local (05XXXXXXXX) or international (+9665XXXXXXXX)
// form — see spec.md Assumptions ("Saudi mobile format").
const ksaPhoneRegex = /^(05\d{8}|\+9665\d{8})$/;

export const emailSchema = z
  .string()
  .min(1, "البريد الإلكتروني مطلوب")
  .email("صيغة البريد الإلكتروني غير صحيحة");

// Minimum strength baseline; Supabase Auth enforces its own server-side
// minimum as well (research.md — no custom rate limiter/strength policy is
// re-implemented here, only client-side UX validation).
export const passwordSchema = z
  .string()
  .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل");

export const phoneSchema = z
  .string()
  .regex(ksaPhoneRegex, "رقم الجوال يجب أن يكون بصيغة سعودية صحيحة (05xxxxxxxx أو +9665xxxxxxxx)");

export const fullNameSchema = z.string().min(1, "الاسم الكامل مطلوب");

export const signupSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
