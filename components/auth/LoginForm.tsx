"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation/auth";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useMergeCartMutation } from "@/lib/store/cartApi";
import { selectGuestCartItems, clearCart } from "@/lib/cart/cartSlice";
import type { RootState } from "@/lib/store";

const RATE_LIMITED_MESSAGE = "محاولات كثيرة جداً — الرجاء المحاولة مرة أخرى بعد بضع دقائق.";
const INVALID_CREDENTIALS_MESSAGE = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const guestCartItems = useSelector((state: RootState) => selectGuestCartItems(state));
  const [mergeCart] = useMergeCartMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const result = loginSchema.safeParse({ email, password });
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
    const { error } = await supabase.auth.signInWithPassword(result.data);

    setSubmitting(false);

    if (error) {
      // Never confirm which of email/password was wrong — mirrors FR-006's
      // non-enumeration principle, applied to login as well as reset.
      const rateLimited = /rate limit|too many/i.test(error.message);
      setFormError(rateLimited ? RATE_LIMITED_MESSAGE : INVALID_CREDENTIALS_MESSAGE);
      return;
    }

    // FR-015: merge the guest (device-local) cart into the account's
    // server-side cart right after a successful sign-in, then clear the
    // guest cart — cartApi's mergeCart mutation invalidates the "Cart" tag
    // on success, so the next getCart read reflects the merged state.
    if (guestCartItems.length > 0) {
      try {
        await mergeCart({
          items: guestCartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }).unwrap();
        dispatch(clearCart());
      } catch {
        // Merge failure shouldn't block sign-in — the guest cart simply
        // stays in localStorage to retry merging on a future login.
      }
    }

    // Only ever navigate to a same-origin relative path from this param —
    // never trust it as an absolute/external URL (open-redirect guard).
    const redirectParam = searchParams.get("redirect");
    const redirectTo =
      redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
        ? redirectParam
        : "/dashboard";

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md w-full" noValidate>
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
        autoComplete="current-password"
      />
      {formError && (
        <p className="font-label-sm text-label-sm text-error text-right">{formError}</p>
      )}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
      </Button>
    </form>
  );
}
