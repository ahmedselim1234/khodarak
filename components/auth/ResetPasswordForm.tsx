"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const EXPIRED_LINK_MESSAGE = "هذا الرابط لم يعد صالحاً.";

type LinkStatus = "checking" | "valid" | "invalid";

export function ResetPasswordForm() {
  const router = useRouter();
  const [linkStatus, setLinkStatus] = useState<LinkStatus>("checking");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Supabase's client exchanges the emailed link for a recovery session
    // automatically on load; a PASSWORD_RECOVERY event (or an existing
    // session) confirms the link was valid and not yet used/expired.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setLinkStatus("valid");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setLinkStatus("valid");
      } else {
        setLinkStatus((current) => (current === "checking" ? "invalid" : current));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const result = resetPasswordSchema.safeParse({ password });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message);
      return;
    }
    setFieldError(undefined);
    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: result.data.password });

    setSubmitting(false);

    if (error) {
      setFormError(EXPIRED_LINK_MESSAGE);
      setLinkStatus("invalid");
      return;
    }

    router.push("/login?reset=success");
  }

  if (linkStatus === "checking") {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant text-center py-stack-lg">
        جارٍ التحقق من الرابط...
      </p>
    );
  }

  if (linkStatus === "invalid") {
    return (
      <div className="flex flex-col items-center gap-stack-sm text-center">
        <p className="font-body-md text-body-md text-error">{EXPIRED_LINK_MESSAGE}</p>
        <a href="/forgot-password" className="text-primary font-bold hover:underline">
          طلب رابط جديد
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md w-full" noValidate>
      <FormField
        label="كلمة المرور الجديدة"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldError}
        type="password"
        autoComplete="new-password"
      />
      {formError && (
        <p className="font-label-sm text-label-sm text-error text-right">{formError}</p>
      )}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
      </Button>
    </form>
  );
}
