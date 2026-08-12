import type { ReactNode } from "react";

const widthClasses = {
  // Forms and auth pages — a 1280px-wide login form looks broken.
  narrow: "max-w-container-narrow",
  default: "max-w-container-max",
  wide: "max-w-container-wide",
} as const;

export function Container({
  width = "default",
  className = "",
  children,
}: {
  width?: keyof typeof widthClasses;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`${widthClasses[width]} mx-auto w-full px-margin-mobile md:px-margin-desktop ${className}`}
    >
      {children}
    </div>
  );
}
