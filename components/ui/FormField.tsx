import type { InputHTMLAttributes } from "react";

export function FormField({
  label,
  error,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div className="flex flex-col gap-2 text-right">
      <label className="flex flex-col gap-2 font-label-sm text-label-sm font-bold text-on-surface-variant">
        {label}
        <input
          className={`w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3 font-normal focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${className}`}
          {...props}
        />
      </label>
      {error && <p className="font-label-sm text-label-sm text-error">{error}</p>}
    </div>
  );
}
