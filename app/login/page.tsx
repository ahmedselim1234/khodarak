import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// No design mockup exists for /login yet — per Clarifications (2026-08-10),
// this route uses the shared design tokens with a generic layout (same
// treatment as /admin) until one is provided.
export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-primary-container/10">
      <Container>
        <Card className="max-w-md mx-auto flex flex-col items-center gap-stack-md text-center">
          <span className="font-display-lg text-display-lg font-bold text-primary">
            خضارك
          </span>
          <h1 className="font-headline-md text-headline-md text-on-background font-bold">
            تسجيل الدخول
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            نموذج تسجيل الدخول الكامل سيُبنى في مرحلة المصادقة القادمة.
          </p>
          <Button type="button" className="w-full" disabled>
            تسجيل الدخول (قريباً)
          </Button>
        </Card>
      </Container>
    </main>
  );
}
