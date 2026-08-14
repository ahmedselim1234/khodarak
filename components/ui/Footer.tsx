import Link from "next/link";
import { Container } from "./Container";

const columns = [
  {
    title: "المتجر",
    links: [
      { href: "/browse", label: "كل المنتجات" },
      { href: "/subscription", label: "ابدأ اشتراكك" },
      { href: "/pricing-preview", label: "حاسبة الأسعار" },
      { href: "/cart", label: "صندوقي" },
    ],
  },
  {
    title: "حسابك",
    links: [
      { href: "/dashboard", label: "لوحة التحكم" },
      { href: "/dashboard/orders", label: "طلباتي" },
      { href: "/dashboard/settings", label: "الإعدادات" },
    ],
  },
];

export function Footer() {
  return (
    // Deep-green ground rather than the old pale cream band. `inverse-surface`
    // is now a brand green, so the page closes on the brand instead of fading
    // out. All pairs below clear AAA: body text 12.9, links 8.72.
    <footer className="mt-stack-3xl bg-inverse-surface text-inverse-on-surface">
      <Container>
        <div className="grid grid-cols-2 gap-stack-lg py-stack-2xl md:grid-cols-4">
          <div className="col-span-2 md:col-span-2">
            <p className="text-h2 font-bold text-inverse-primary">خضارك</p>
            <p className="mt-stack-sm max-w-xs text-small text-inverse-on-surface/90">
              اشتراك أسبوعي أو شهري في الخضروات والفواكه الطازجة، يوصل إلى باب
              بيتك.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-overline uppercase text-inverse-primary">
                {column.title}
              </p>
              <ul className="mt-stack-sm flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-small text-inverse-on-surface transition-colors duration-fast hover:text-inverse-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-inverse-on-surface/15 py-stack-md">
          <p className="text-caption text-inverse-on-surface/80">
            © {new Date().getFullYear()} خضارك. جميع الحقوق محفوظة.
          </p>
        </div>
      </Container>
    </footer>
  );
}
