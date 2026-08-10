const STEPS: Array<{ id: "build" | "checkout"; label: string }> = [
  { id: "build", label: "تخصيص الصندوق" },
  { id: "checkout", label: "إتمام الطلب" },
];

// Presentational — the 2-step progress indicator (design/subscription-builder.html's
// wizard header, collapsed to this phase's two real steps).
export function WizardProgressHeader({ activeStep }: { activeStep: "build" | "checkout" }) {
  const activeIndex = STEPS.findIndex((step) => step.id === activeStep);

  return (
    <div className="flex items-center justify-center gap-stack-lg mb-stack-lg" dir="rtl">
      {STEPS.map((step, index) => (
        <div key={step.id} className="flex items-center gap-2">
          <div
            className={
              index <= activeIndex
                ? "w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-label-sm"
                : "w-8 h-8 rounded-full border-2 border-outline-variant text-outline flex items-center justify-center font-bold text-label-sm"
            }
          >
            {index + 1}
          </div>
          <span
            className={
              index <= activeIndex
                ? "font-label-sm text-label-sm text-primary font-bold"
                : "font-label-sm text-label-sm text-on-surface-variant"
            }
          >
            {step.label}
          </span>
          {index < STEPS.length - 1 && <div className="w-8 h-0.5 bg-outline-variant mx-2" />}
        </div>
      ))}
    </div>
  );
}
