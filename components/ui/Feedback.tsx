import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

const alertTones = {
  info: { cls: "bg-info-container text-on-info-container", Icon: Info },
  success: { cls: "bg-success-container text-on-success-container", Icon: CheckCircle2 },
  warning: { cls: "bg-warning-container text-on-warning-container", Icon: AlertTriangle },
  danger: { cls: "bg-error-container text-on-error-container", Icon: XCircle },
} as const;

export function Alert({
  tone = "info",
  title,
  className = "",
  children,
}: {
  tone?: keyof typeof alertTones;
  title?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  const { cls, Icon } = alertTones[tone];
  return (
    <div
      role="status"
      // `border-s-4 border-current` gives the alert a tone-colored spine on the
      // inline-start edge — logical, so it lands on the right in RTL.
      className={`flex animate-fade-in items-start gap-3 rounded-lg border-s-4 border-current p-3.5 ${cls} ${className}`}
    >
      <Icon className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="min-w-0 text-small">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {children}
      </div>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    // `.skeleton` (globals.css) sweeps a highlight along the inline axis instead
    // of pulsing the whole block. A directional sweep reads as loading; a fade
    // in and out reads as something broken.
    <div className={`skeleton rounded-md ${className}`} aria-hidden="true" />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex animate-fade-up flex-col items-center justify-center text-center py-stack-xl px-margin-mobile ${className}`}
    >
      {icon && (
        <div className="mb-stack-md flex size-14 animate-scale-in items-center justify-center rounded-full bg-primary-container text-on-primary-container [animation-delay:120ms]">
          {icon}
        </div>
      )}
      <p className="text-h3 text-on-surface">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-small text-on-surface-variant">
          {description}
        </p>
      )}
      {action && <div className="mt-stack-md">{action}</div>}
    </div>
  );
}
