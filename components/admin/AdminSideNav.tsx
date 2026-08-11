import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin", label: "لوحة التحكم", icon: "dashboard" },
  { href: "/admin/products", label: "المنتجات", icon: "inventory_2" },
  { href: "/admin/subscriptions", label: "الاشتراكات", icon: "calendar_today" },
  { href: "/admin/orders", label: "الطلبات", icon: "package_2" },
  { href: "/admin/payments", label: "المدفوعات", icon: "payments" },
  { href: "/admin/cities", label: "المدن", icon: "location_on" },
  { href: "/admin/settings", label: "الإعدادات", icon: "settings" },
] as const;

// Server Component — /admin has never had a consistent side nav before this
// phase (only individual product/settings screens with their own bare
// TopNav shell). Mirrors components/dashboard/SideNav.tsx (Phase 6)'s exact
// shape: `activePath` passed by each page rather than introspected, since a
// Server Component has no built-in access to the current pathname.
export function AdminSideNav({ activePath }: { activePath: string }) {
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
