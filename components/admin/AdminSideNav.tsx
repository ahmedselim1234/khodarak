import Link from "next/link";
import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  MapPin,
  Package2,
  PackageSearch,
  Percent,
  Settings,
  type LucideIcon,
} from "lucide-react";

const NAV_ITEMS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/admin", label: "لوحة التحكم", Icon: LayoutDashboard },
  { href: "/admin/products", label: "المنتجات", Icon: PackageSearch },
  { href: "/admin/subscriptions", label: "الاشتراكات", Icon: CalendarDays },
  { href: "/admin/orders", label: "الطلبات", Icon: Package2 },
  { href: "/admin/payments", label: "المدفوعات", Icon: CreditCard },
  { href: "/admin/cities", label: "المدن", Icon: MapPin },
  { href: "/admin/delivery-intervals", label: "إدارة الخصومات", Icon: Percent },
  { href: "/admin/settings", label: "الإعدادات", Icon: Settings },
];

// Server Component — mirrors components/dashboard/SideNav.tsx exactly:
// `activePath` is passed by each page rather than introspected, since a Server
// Component has no built-in access to the current pathname.
export function AdminSideNav({ activePath }: { activePath: string }) {
  return (
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
