import type { HTMLAttributes, ReactNode } from "react";

// Padding used to be hardcoded at p-8 for every card, including ones holding a
// single table or a two-field form. `md` is the new default.
const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

const variantClasses = {
  // Default: sits on the cream `background`, so plain white plus a hairline
  // is enough separation — no shadow needed.
  flat: "bg-surface border border-outline-variant",
  raised:
    "bg-surface border border-outline-variant/70 shadow-md transition-shadow duration-slow ease-out-expo hover:shadow-lg",
  outlined: "bg-transparent border border-outline-variant",
  filled: "bg-surface-container border border-transparent",
  // Brand-tinted panel, for the one card per view that should carry weight
  // (featured plan, upgrade prompt). Container tier, so text stays dark.
  brand: "bg-primary-container border border-transparent text-on-primary-container",
} as const;

export function Card({
  padding = "md",
  variant = "flat",
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  padding?: keyof typeof paddingClasses;
  variant?: keyof typeof variantClasses;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-organic ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className = "",
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-stack-md mb-stack-md ${className}`}>
      <div className="min-w-0">
        <h2 className="text-h3 text-on-surface">{title}</h2>
        {description && (
          <p className="text-small text-on-surface-variant mt-1">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
