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
  // `hover:brightness-110` rather than the previous swap to
  // `bg-primary-container text-on-primary-container`: that inverted a
  // light-on-dark button into dark-on-light mid-hover, which reads as the
  // control becoming disabled. Brightening the existing fill keeps the
  // on-primary contrast contract intact at every point of the transition.
  primary:
    "bg-primary text-on-primary shadow-sm hover:brightness-110 hover:shadow-glow-primary active:shadow-xs",
  secondary:
    "bg-secondary text-on-secondary shadow-sm hover:brightness-110 hover:shadow-glow-secondary active:shadow-xs",
  // Fill-only token warning does not apply here: `on-accent` is #3D2600 on
  // #FFB020, which is 7.78.
  accent:
    "bg-accent text-on-accent shadow-sm hover:brightness-105 hover:shadow-glow-accent active:shadow-xs",
  outline:
    "border border-primary text-primary bg-transparent hover:bg-primary-container hover:text-on-primary-container",
  ghost:
    "text-on-surface-variant bg-transparent hover:bg-surface-container hover:text-on-surface",
  danger:
    "bg-error text-on-error shadow-sm hover:brightness-110 hover:shadow-md active:shadow-xs",
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
      // Transform is press-feedback ONLY. The old `hover:scale-105` read as
      // cheap on large surfaces and is not coming back; a small `active` dip is
      // a different thing — it acknowledges the click rather than animating on
      // approach. `scale` has no direction, so it needs no RTL handling.
      className={`inline-flex items-center justify-center font-semibold whitespace-nowrap transition-[background-color,color,box-shadow,border-color,filter,transform] duration-fast ease-out-quart active:scale-[0.98] motion-reduce:active:scale-100 disabled:opacity-45 disabled:pointer-events-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
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
