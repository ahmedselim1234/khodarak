import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-organic organic-shadow border border-outline-variant/20 p-8 ${className}`}
    >
      {children}
    </div>
  );
}
