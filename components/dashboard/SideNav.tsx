import Link from "next/link";
import { LayoutDashboard, Package2, Settings, type LucideIcon } from "lucide-react";

const NAV_ITEMS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/dashboard", label: "لوحة التحكم", Icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "طلباتي", Icon: Package2 },
  { href: "/dashboard/settings", label: "الإعدادات", Icon: Settings },
];

// Server Component — the dashboard side nav (لوحة التحكم / طلباتي / الإعدادات).
// Shared by all three dashboard pages via app/dashboard/layout.tsx.
// `activePath` is passed by each page rather than introspected — a plain
// Server Component has no access to the current pathname, and every dashboard
// page already knows its own route.
export function SideNav({ activePath }: { activePath: string }) {
  return (
    // border-e, not border-l: the sidebar sits at the inline start (right in
    // RTL), so its dividing edge is the inline end.
    <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-64 shrink-0 flex-col border-e border-outline-variant bg-surface-container-low p-stack-sm lg:flex">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = activePath === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-small transition-colors duration-fast ${
                active
                  ? "bg-primary-container font-semibold text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <Icon className="size-[18px] shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
