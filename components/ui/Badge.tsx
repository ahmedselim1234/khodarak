import type { ReactNode } from "react";

const toneClasses = {
  neutral: "bg-surface-container-high text-on-surface-variant",
  brand: "bg-primary-container text-on-primary-container",
  accent: "bg-secondary-container text-on-secondary-container",
  success: "bg-success-container text-on-success-container",
  warning: "bg-warning-container text-on-warning-container",
  danger: "bg-error-container text-on-error-container",
  info: "bg-info-container text-on-info-container",
} as const;

export type BadgeTone = keyof typeof toneClasses;

export function Badge({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-semibold ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// Order and subscription statuses were previously styled inline, with a
// different color choice in each file that rendered them.
const statusTones: Record<string, BadgeTone> = {
  active: "success",
  delivered: "success",
  completed: "success",
  paid: "success",
  pending: "warning",
  pending_payment: "warning",
  processing: "info",
  out_for_delivery: "info",
  paused: "neutral",
  suspended: "warning",
  cancelled: "danger",
  canceled: "danger",
  failed: "danger",
  refunded: "neutral",
};

export function StatusPill({
  status,
  label,
  className = "",
}: {
  status: string;
  label: ReactNode;
  className?: string;
}) {
  return (
    <Badge tone={statusTones[status] ?? "neutral"} className={className}>
      <span
        className="size-1.5 rounded-full bg-current opacity-70"
        aria-hidden="true"
      />
      {label}
    </Badge>
  );
}
