import Link from "next/link";
import { LayoutDashboard, ShieldCheck, UserCircle2 } from "lucide-react";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { CartBar } from "@/components/cart/CartBar";
import { MobileNavMenu } from "@/components/ui/MobileNavMenu";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/browse", label: "المنتجات" },
  { href: "/subscription", label: "الاشتراكات" },
  { href: "/pricing-preview", label: "حاسبة الأسعار" },
];

export async function TopNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // An admin's control panel is /admin, not the customer dashboard — same
  // rule the login redirect applies. Read only when signed in, so a signed-out
  // visitor's nav costs no extra query.
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant glass-effect">
      <Container>
        {/* No flex-row-reverse: <html dir="rtl"> already lays flex rows out
            right-to-left, so reversing them flipped the nav back to LTR. */}
        <nav className="flex h-16 items-center justify-between gap-stack-md">
          <Link
            href="/"
            className="transition-opacity duration-fast hover:opacity-80"
            aria-label="خضارك — الصفحة الرئيسية"
          >
            <Logo size="md" priority />
          </Link>

          <div className="hidden items-center gap-stack-lg text-small md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                className="font-medium text-on-surface-variant transition-colors duration-fast hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-stack-sm">
            <MobileNavMenu links={links} />
            <CartBar />
            {user ? (
              <>
                <Link
                  href={isAdmin ? "/admin" : "/dashboard"}
                  prefetch
                  className="rounded-full p-2 text-primary transition-colors duration-fast hover:bg-primary-container"
                  aria-label={isAdmin ? "لوحة الإدارة" : "لوحة التحكم"}
                >
                  {isAdmin ? (
                    <ShieldCheck className="size-5" aria-hidden="true" />
                  ) : (
                    <LayoutDashboard className="size-5" aria-hidden="true" />
                  )}
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/login"
                prefetch
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
