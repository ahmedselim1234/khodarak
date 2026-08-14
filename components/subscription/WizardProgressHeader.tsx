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
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-label-sm transition-[background-color,border-color,color] duration-slow ease-out-expo ${
              index <= activeIndex
                ? "bg-primary text-on-primary"
                : "border-2 border-outline-variant text-outline"
            } ${
              // Only the step you are ON pulses. A completed step that kept
              // throbbing would compete with the one asking for attention.
              index === activeIndex ? "animate-pulse-ring" : ""
            }`}
          >
            {index + 1}
          </div>
          <span
            className={`font-label-sm text-label-sm transition-colors duration-slow ${
              index <= activeIndex
                ? "text-primary font-bold"
                : "text-on-surface-variant"
            }`}
          >
            {step.label}
          </span>
          {index < STEPS.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-2 transition-colors duration-slow ease-out-expo ${
                index < activeIndex ? "bg-primary" : "bg-outline-variant"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
