"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { env } from "@/lib/env";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const CONFIRMATION_MESSAGE =
  "إذا كان هذا البريد الإلكتروني مسجلاً لدينا، فقد أرسلنا رابط إعادة تعيين كلمة المرور إليه.";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message);
      return;
    }
    setFieldError(undefined);
    setSubmitting(true);

    const supabase = createClient();
    // Pinned to the configured site origin, not window.location.origin: the
    // emailed link must point at the canonical domain no matter which host the
    // form was submitted from, and Supabase only honours redirects that are on
    // its dashboard allow-list anyway.
    await supabase.auth.resetPasswordForEmail(result.data.email, {
      redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    // FR-006: always show the same confirmation, whether or not the call
    // succeeded or the email is registered — never confirms account
    // existence (contracts/auth-flows.md).
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant text-center">
        {CONFIRMATION_MESSAGE}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md w-full" noValidate>
      <FormField
        label="البريد الإلكتروني"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldError}
        type="email"
        autoComplete="email"
        dir="ltr"
      />
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "جارٍ الإرسال..." : "إرسال رابط إعادة التعيين"}
      </Button>
    </form>
  );
}
