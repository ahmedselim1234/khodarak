import Link from "next/link";

const NAV_ITEMS = [
  { href: "/dashboard", label: "لوحة التحكم", icon: "dashboard" },
  { href: "/dashboard/orders", label: "طلباتي", icon: "package_2" },
  { href: "/dashboard/settings", label: "الإعدادات", icon: "settings" },
] as const;

// Server Component — design/dashboard.html's side nav (لوحة التحكم / طلباتي /
// الإعدادات), matching plan.md §0.B's actual resolved route table (the
// mockup's separate "اشتراكاتي"/"العناوين" entries both fold into these
// three real routes — subscription management lives on /dashboard itself,
// address management lives on /dashboard/settings). Shared by all three
// dashboard pages via app/dashboard/layout.tsx. `activePath` is passed by
// each page rather than introspected — a plain Server Component has no
// built-in access to the current pathname (that's a Client Component-only
// hook), and every dashboard page already knows its own route.
export function SideNav({ activePath }: { activePath: string }) {
  return (
    <aside className="hidden lg:flex flex-col h-[calc(100vh-80px)] w-72 sticky top-20 bg-surface-container-low p-stack-md border-l border-outline-variant">
      <nav className="flex flex-col gap-stack-sm">
        {NAV_ITEMS.map((item) => {
          const active = activePath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "bg-secondary-container text-on-secondary-container rounded-xl font-bold flex flex-row-reverse items-center gap-stack-md px-4 py-3 transition-all"
                  : "text-on-surface-variant flex flex-row-reverse items-center gap-stack-md px-4 py-3 hover:bg-surface-container-high transition-all rounded-xl"
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-body-md text-body-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
