import type { ReactNode } from "react";
import { Container } from "./Container";
import { Card } from "./Card";

export function PagePlaceholder({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <Container>
      <div className="py-stack-lg">
        <Card className="flex flex-col items-start gap-stack-md text-right">
          <span className="material-symbols-outlined text-primary text-5xl" aria-hidden>
            {icon}
          </span>
          <h1 className="font-headline-md text-headline-md text-on-background font-bold">
            {title}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            {description}
          </p>
          {children}
        </Card>
      </div>
    </Container>
  );
}
