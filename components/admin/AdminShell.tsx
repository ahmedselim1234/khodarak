import type { ReactNode } from "react";
import { TopNav } from "@/components/ui/TopNav";
import { Container } from "@/components/ui/Container";
import { AdminSideNav } from "./AdminSideNav";

// Shared chrome for every /admin/* route (TopNav + AdminSideNav + content
// well), mirroring components/dashboard/DashboardShell.tsx (Phase 6)'s
// exact shape. Applied to both the new screens this phase adds and the
// existing products/settings screens (Phase 2/3), which never had
// consistent chrome before this phase.
export function AdminShell({
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
        <AdminSideNav activePath={activePath} />
        <main className="flex-1 min-w-0">
          <Container>
            {/* Admin deliberately gets a plain fade and nothing more — no
                scroll reveals, no stagger, no ambient motion. This is a
                high-frequency tool; entrance choreography that delights on a
                landing page becomes friction on the twentieth page load. */}
            <div className="animate-fade-in py-stack-lg">{children}</div>
          </Container>
        </main>
      </div>
    </>
  );
}
