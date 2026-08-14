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
                // The underline grows from `origin-center` on purpose:
                // Tailwind's `origin-left` / `origin-right` are physical, so a
                // start-anchored underline would grow the wrong way in RTL.
                // Centre-out sidesteps the direction question entirely.
                className="relative font-medium text-on-surface-variant transition-colors duration-fast hover:text-primary after:absolute after:-bottom-1 after:inset-x-0 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-fast after:ease-out-quart hover:after:scale-x-100"
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
                  className="rounded-full p-2 text-primary transition-[background-color,transform] duration-fast ease-out-quart hover:bg-primary-container active:scale-90 motion-reduce:active:scale-100"
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
                className="rounded-full p-2 text-primary transition-[background-color,transform] duration-fast ease-out-quart hover:bg-primary-container active:scale-90 motion-reduce:active:scale-100"
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
