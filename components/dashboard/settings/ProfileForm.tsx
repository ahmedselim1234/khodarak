"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useUpdateProfileMutation } from "@/lib/store/settingsApi";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

// "use client" — name/phone fields, PATCH /api/profile. router.refresh()
// on success (contracts/settings-api.md's Notes) reflects the new name
// anywhere the settings page's own server-rendered content shows it.
export function ProfileForm({
  initialFullName,
  initialPhone,
}: {
  initialFullName: string;
  initialPhone: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setSuccess(false);
    try {
      await updateProfile({ fullName, phone }).unwrap();
      setSuccess(true);
      router.refresh();
    } catch (err) {
      const data = (err as { data?: { fields?: Record<string, string> } })?.data;
      if (data?.fields) {
        setFieldErrors(data.fields);
      } else {
        setFormError("تعذر حفظ التغييرات. حاول مرة أخرى.");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md" noValidate>
      <FormField
        label="الاسم الكامل"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={fieldErrors.fullName}
      />
      <FormField
        label="رقم الجوال"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={fieldErrors.phone}
      />
      {success && (
        <p className="font-label-sm text-label-sm text-primary">تم حفظ التغييرات بنجاح</p>
      )}
      {formError && (
        <p className="font-label-sm text-label-sm text-error">{formError}</p>
      )}
      <Button type="submit" disabled={isLoading} className="self-start">
        {isLoading ? "جارٍ الحفظ..." : "حفظ التغييرات"}
      </Button>
    </form>
  );
}
