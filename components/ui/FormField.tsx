import type { InputHTMLAttributes } from "react";
import { Input } from "./Input";

// Retained as a thin alias over `Input` so the four auth forms and the settings
// forms that import it keep working unchanged. Prefer `Input` in new code.
export function FormField({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return <Input label={label} error={error} {...props} />;
}
