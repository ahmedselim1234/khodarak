import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Field, controlClasses, controlErrorClasses } from "./Field";

type Base = { label?: string; hint?: string; error?: string };

export function Input({
  label,
  hint,
  error,
  className = "",
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & Base) {
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id} required={props.required}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        className={`${controlClasses} ${error ? controlErrorClasses : ""} ${className}`}
        {...props}
      />
    </Field>
  );
}

export function Textarea({
  label,
  hint,
  error,
  className = "",
  id,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & Base) {
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id} required={props.required}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        className={`${controlClasses} min-h-24 resize-y ${error ? controlErrorClasses : ""} ${className}`}
        {...props}
      />
    </Field>
  );
}

export function Select({
  label,
  hint,
  error,
  className = "",
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & Base) {
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id} required={props.required}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        className={`${controlClasses} ${error ? controlErrorClasses : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}

export function Checkbox({
  label,
  className = "",
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-2.5 cursor-pointer text-body-md text-on-surface ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        className="mt-1 size-4 shrink-0 rounded-[4px] border-outline-variant text-primary accent-primary focus:shadow-focus"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}

export function Radio({
  label,
  className = "",
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-2.5 cursor-pointer text-body-md text-on-surface ${className}`}
    >
      <input
        id={id}
        type="radio"
        className="mt-1 size-4 shrink-0 border-outline-variant accent-primary focus:shadow-focus"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
