import Link from "next/link";
import { LayoutDashboard, UserCircle2 } from "lucide-react";
import { Container } from "./Container";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { CartBar } from "@/components/cart/CartBar";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/browse", label: "المنتجات" },
  { href: "/subscription", label: "الاشتراكات" },
];

export async function TopNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant glass-effect">
      <Container>
        {/* No flex-row-reverse: <html dir="rtl"> already lays flex rows out
            right-to-left, so reversing them flipped the nav back to LTR. */}
        <nav className="flex h-16 items-center justify-between gap-stack-md">
          <Link
            href="/"
            className="text-h2 font-bold text-primary transition-opacity duration-fast hover:opacity-80"
          >
            خضارك
          </Link>

          <div className="hidden items-center gap-stack-lg text-small md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium text-on-surface-variant transition-colors duration-fast hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-stack-sm">
            <CartBar />
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-full p-2 text-primary transition-colors duration-fast hover:bg-primary-container"
                  aria-label="لوحة التحكم"
                >
                  <LayoutDashboard className="size-5" aria-hidden="true" />
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full p-2 text-primary transition-colors duration-fast hover:bg-primary-container"
                aria-label="تسجيل الدخول"
              >
                <UserCircle2 className="size-5" aria-hidden="true" />
              </Link>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
}
