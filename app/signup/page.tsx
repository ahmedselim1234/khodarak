import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { SignupForm } from "@/components/auth/SignupForm";

// No design mockup exists for /signup — same generic-layout treatment as
// /login and /admin from Phase 0 (spec.md Assumptions).
export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-primary-container/10 py-stack-lg">
      <Container>
        <Card className="max-w-md mx-auto flex flex-col gap-stack-md">
          <div className="flex flex-col items-center gap-stack-sm text-center">
            <span className="font-display-lg text-display-lg font-bold text-primary">
              خضارك
            </span>
            <h1 className="font-headline-md text-headline-md text-on-background font-bold">
              إنشاء حساب جديد
            </h1>
          </div>
          <SignupForm />
          <p className="font-body-md text-body-md text-on-surface-variant text-center">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </Card>
      </Container>
    </main>
  );
}
