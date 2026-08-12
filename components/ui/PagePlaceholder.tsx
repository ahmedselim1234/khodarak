import type { ReactNode } from "react";
import { Container } from "./Container";
import { Card } from "./Card";

export function PagePlaceholder({
  icon,
  title,
  description,
  children,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <Container>
      <div className="py-stack-xl">
        <Card padding="lg" className="flex flex-col items-start gap-stack-md">
          {icon && (
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
              {icon}
            </div>
          )}
          <h1 className="text-h1 text-on-surface">{title}</h1>
          <p className="max-w-2xl text-body-lg text-on-surface-variant">
            {description}
          </p>
          {children}
        </Card>
      </div>
    </Container>
  );
}
