import type { ReactNode } from "react";

export function Container({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      {children}
    </div>
  );
}
