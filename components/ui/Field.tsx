import type { ReactNode } from "react";

// Shared label/hint/error wrapper. Every form in the app previously repeated
// this markup inline with slightly different spacing and error styling.
export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  className = "",
  children,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 text-start ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="text-label-sm text-on-surface">
          {label}
          {required && (
            <span className="text-error ms-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-caption text-error">{error}</p>
      ) : hint ? (
        <p className="text-caption text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}

// Shared by Input / Select / Textarea so they stay visually identical.
export const controlClasses =
  "w-full bg-surface border border-outline-variant rounded-lg px-3.5 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/60 transition-[border-color,box-shadow] duration-fast ease-out-quart hover:border-outline focus:border-primary focus:shadow-focus focus:outline-none disabled:bg-surface-container disabled:text-on-surface-variant disabled:cursor-not-allowed";

export const controlErrorClasses = "border-error focus:border-error";
