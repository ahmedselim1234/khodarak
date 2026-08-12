import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

// Presentational — renders subscriptionHealth.ts's 'good' | 'needs_attention'
// output as the bento layout's health indicator (spec.md Clarification 1: a
// small set of plain states, not a numeric score).
export function SubscriptionHealthBadge({ health }: { health: "good" | "needs_attention" }) {
  if (health === "needs_attention") {
    return (
      <Badge tone="warning">
        <AlertTriangle className="size-3.5" aria-hidden="true" />
        يحتاج انتباه
      </Badge>
    );
  }

  return (
    <Badge tone="success">
      <CheckCircle2 className="size-3.5" aria-hidden="true" />
      بحالة جيدة
    </Badge>
  );
}
