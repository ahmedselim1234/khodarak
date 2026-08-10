import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-primary-container/10 py-stack-lg">
      <Container>
        <Card className="max-w-md mx-auto flex flex-col gap-stack-md">
          <div className="flex flex-col items-center gap-stack-sm text-center">
            <span className="font-display-lg text-display-lg font-bold text-primary">
              خضارك
            </span>
            <h1 className="font-headline-md text-headline-md text-on-background font-bold">
              استعادة كلمة المرور
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
            </p>
          </div>
          <ForgotPasswordForm />
          <p className="font-body-md text-body-md text-on-surface-variant text-center">
            <Link href="/login" className="text-primary font-bold hover:underline">
              العودة إلى تسجيل الدخول
            </Link>
          </p>
        </Card>
      </Container>
    </main>
  );
}
