import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "@/components/auth/LoginForm";

// No design mockup exists for /login yet — per Clarifications (2026-08-10),
// this route uses the shared design tokens with a generic layout (same
// treatment as /admin) until one is provided.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-primary-container/10 py-stack-lg">
      <Container>
        <Card className="max-w-md mx-auto flex flex-col gap-stack-md">
          <div className="flex flex-col items-center gap-stack-sm text-center">
            <span className="font-display-lg text-display-lg font-bold text-primary">
              خضارك
            </span>
            <h1 className="font-headline-md text-headline-md text-on-background font-bold">
              تسجيل الدخول
            </h1>
            {reset === "success" && (
              <p className="font-label-sm text-label-sm text-primary">
                تم تحديث كلمة المرور بنجاح — الرجاء تسجيل الدخول.
              </p>
            )}
          </div>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/forgot-password"
              className="font-label-sm text-label-sm text-primary hover:underline"
            >
              نسيت كلمة المرور؟
            </Link>
            <p className="font-body-md text-body-md text-on-surface-variant">
              ليس لديك حساب؟{" "}
              <Link href="/signup" className="text-primary font-bold hover:underline">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </Card>
      </Container>
    </main>
  );
}
