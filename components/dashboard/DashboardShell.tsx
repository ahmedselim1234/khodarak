import type { ReactNode } from "react";
import { TopNav } from "@/components/ui/TopNav";
import { Container } from "@/components/ui/Container";
import { SideNav } from "./SideNav";

// Shared chrome for all three dashboard routes (TopNav + SideNav +
// content well) — a plain component rather than a Next.js route-segment
// `layout.tsx`, since SideNav's active-item highlighting needs the current
// route and a Server Component layout has no built-in way to read it
// without pulling the whole shell into a Client Component. Each page passes
// its own route as `activePath`.
export function DashboardShell({
  activePath,
  children,
}: {
  activePath: string;
  children: ReactNode;
}) {
  return (
    <>
      <TopNav />
      <div className="max-w-container-max mx-auto flex flex-row-reverse relative min-h-screen">
        <SideNav activePath={activePath} />
        <main className="flex-1 min-w-0">
          <Container>
            <div className="animate-fade-up py-stack-lg">{children}</div>
          </Container>
        </main>
      </div>
    </>
  );
}
