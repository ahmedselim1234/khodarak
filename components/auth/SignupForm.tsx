"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signupSchema } from "@/lib/validation/auth";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

// FR-001/002/007: creates the auth account; the matching profiles row is
// created atomically by the auth.users trigger (see supabase/migrations),
// not by this component.
export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const result = signupSchema.safeParse({ fullName, phone, email, password });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        errors[String(issue.path[0])] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: { full_name: result.data.fullName, phone: result.data.phone },
      },
    });

    setSubmitting(false);

    if (error) {
      const alreadyRegistered = /already registered|already exists|user already/i.test(
        error.message
      );
      setFormError(
        alreadyRegistered
          ? "هذا البريد الإلكتروني مسجل بالفعل — جرّب تسجيل الدخول بدلاً من ذلك."
          : error.message
      );
      return;
    }

    // If email confirmation is required on this project, signUp() succeeds
    // but returns no session — redirecting to /dashboard would just bounce
    // straight back to /login via middleware. Show a "check your email"
    // state instead of assuming immediate sign-in (spec.md's "no email
    // confirmation" Assumption is a per-project default, not guaranteed).
    if (!data.session) {
      setConfirmationPending(true);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (confirmationPending) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant text-center">
        تم إنشاء الحساب — الرجاء تفقد بريدك الإلكتروني لتأكيد الحساب قبل تسجيل الدخول.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md w-full" noValidate>
      <FormField
        label="الاسم الكامل"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={fieldErrors.fullName}
        autoComplete="name"
      />
      <FormField
        label="رقم الجوال"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={fieldErrors.phone}
        type="tel"
        placeholder="05xxxxxxxx"
        autoComplete="tel"
        dir="ltr"
      />
      <FormField
        label="البريد الإلكتروني"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        type="email"
        autoComplete="email"
        dir="ltr"
      />
      <FormField
        label="كلمة المرور"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        type="password"
        autoComplete="new-password"
      />
      {formError && (
        <p className="font-label-sm text-label-sm text-error text-right">{formError}</p>
      )}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}
      </Button>
    </form>
  );
}
