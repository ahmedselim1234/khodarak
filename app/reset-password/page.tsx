import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-primary-container/10 py-stack-lg">
      <Container>
        <Card className="max-w-md mx-auto flex flex-col gap-stack-md">
          <div className="flex flex-col items-center gap-stack-sm text-center">
            <span className="font-display-lg text-display-lg font-bold text-primary">
              خضارك
            </span>
            <h1 className="font-headline-md text-headline-md text-on-background font-bold">
              تعيين كلمة مرور جديدة
            </h1>
          </div>
          <ResetPasswordForm />
        </Card>
      </Container>
    </main>
  );
}
