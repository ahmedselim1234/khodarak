import type { ButtonHTMLAttributes } from "react";

const variantClasses = {
  primary:
    "bg-primary text-on-primary hover:scale-105 active:scale-95 organic-shadow",
  outline:
    "border-2 border-primary text-primary hover:bg-primary hover:text-white",
} as const;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variantClasses;
}) {
  return (
    <button
      className={`px-8 py-4 rounded-organic font-headline-md text-headline-md transition-all ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
