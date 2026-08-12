import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

// Sizes follow the compact scale. The previous single size rendered every
// button in the app at 24px text with 32px padding, which is why they read as
// oversized. `md` is the default and covers most cases; reserve `lg` for a
// page's single primary call to action.
const sizeClasses = {
  sm: "h-8 px-3 text-caption gap-1.5 rounded-md",
  md: "h-10 px-5 text-label-sm gap-2 rounded-lg",
  lg: "h-[52px] px-7 text-body-md font-semibold gap-2.5 rounded-organic",
} as const;

const variantClasses = {
  primary:
    "bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:text-on-primary-container hover:shadow-md active:shadow-xs",
  secondary:
    "bg-secondary text-on-secondary shadow-sm hover:bg-on-secondary-container hover:shadow-md active:shadow-xs",
  outline:
    "border border-primary text-primary bg-transparent hover:bg-primary-container hover:text-on-primary-container",
  ghost:
    "text-on-surface-variant bg-transparent hover:bg-surface-container hover:text-on-surface",
  danger:
    "bg-error text-on-error shadow-sm hover:bg-on-error-container hover:shadow-md active:shadow-xs",
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  startIcon,
  endIcon,
  className = "",
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}) {
  return (
    <button
      // Transitions are limited to colors/shadow — no transform. The old
      // hover:scale-105 / active:scale-95 pop read as cheap on large surfaces.
      className={`inline-flex items-center justify-center font-semibold whitespace-nowrap transition-[background-color,color,box-shadow,border-color] duration-fast ease-out-quart disabled:opacity-45 disabled:pointer-events-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        startIcon
      )}
      {children}
      {!loading && endIcon}
    </button>
  );
}
