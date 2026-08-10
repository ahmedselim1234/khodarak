import Link from "next/link";
import { Container } from "./Container";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/SignOutButton";

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
    <header className="sticky top-0 w-full bg-surface/95 backdrop-blur-md shadow-sm z-50">
      <Container>
        <nav className="flex flex-row-reverse justify-between items-center h-20">
          <Link href="/" className="font-display-lg text-display-lg font-bold text-primary">
            خضارك
          </Link>
          <div className="hidden md:flex flex-row-reverse items-center gap-stack-lg font-body-md text-body-md">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-row-reverse items-center gap-stack-md">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="material-symbols-outlined text-primary p-2 rounded-full hover:bg-surface-container-low transition-all active:scale-95"
                  aria-label="لوحة التحكم"
                >
                  space_dashboard
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/login"
                className="material-symbols-outlined text-primary p-2 rounded-full hover:bg-surface-container-low transition-all active:scale-95"
                aria-label="تسجيل الدخول"
              >
                account_circle
              </Link>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
}
