"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

// Shared modal shell for PauseDialog, CancelDialog, AdminPauseDialog,
// AdminCancelDialog and ReplaceCardDialog — each of which previously
// hand-rolled its own overlay with no escape key, no focus trap, and no
// scroll lock.
export function Dialog({
  title,
  description,
  onClose,
  footer,
  children,
  className = "",
}: {
  title: ReactNode;
  description?: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);

    // Lock background scroll while the dialog is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the panel so keyboard and screen-reader users land here.
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex animate-overlay-in items-center justify-center bg-inverse-surface/55 p-stack-md backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={`w-full max-w-md animate-scale-in rounded-organic bg-surface p-6 shadow-xl outline-none ${className}`}
      >
        <div className="mb-stack-md flex items-start justify-between gap-stack-md">
          <div className="min-w-0">
            <h2 className="text-h3 text-on-surface">{title}</h2>
            {description && (
              <p className="mt-1 text-small text-on-surface-variant">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="-me-1.5 -mt-1 shrink-0 rounded-md p-1.5 text-on-surface-variant transition-colors duration-fast hover:bg-surface-container hover:text-on-surface"
          >
            <X className="size-4.5" aria-hidden="true" />
          </button>
        </div>

        {children}

        {footer && (
          <div className="mt-stack-lg flex justify-end gap-stack-sm">{footer}</div>
        )}
      </div>
    </div>
  );
}
