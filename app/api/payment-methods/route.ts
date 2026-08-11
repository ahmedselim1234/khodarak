import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchPayment } from "@/lib/payments/moyasarClient";
import { replacePaymentMethod } from "@/lib/subscription/mutateSubscription";
import { paymentMethodReplaceSchema } from "@/lib/validation/paymentMethodReplace";

// POST /api/payment-methods — per contracts/settings-api.md (research.md
// §5). Replaces the caller's saved card. The client only ever supplies the
// Moyasar $0 save_only payment id — brand/last-four/expiry/token are always
// read back authoritatively from Moyasar's own API (moyasarClient.fetchPayment,
// the same function Phase 5's callback route uses), never trusted from the
// client (Constitution Principle II/V).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = paymentMethodReplaceSchema.safeParse(body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      fields[String(issue.path[0])] = issue.message;
    }
    return NextResponse.json({ error: "validation_failed", fields }, { status: 400 });
  }

  let payment;
  try {
    payment = await fetchPayment(result.data.moyasarPaymentId);
  } catch {
    return NextResponse.json({ error: "provider_error" }, { status: 502 });
  }

  const source = payment.source;
  const token = source?.token;
  if (!source || !token) {
    return NextResponse.json({ error: "token_not_reusable" }, { status: 422 });
  }

  const lastFour = source.number ? source.number.slice(-4) : "0000";
  const expMonth = Number(source.month) || 12;
  const expYear = Number(source.year) || new Date().getFullYear() + 3;

  const created = await replacePaymentMethod({
    userId: user.id,
    moyasarTokenId: token,
    brand: source.company ?? "unknown",
    lastFour,
    expMonth,
    expYear,
  });

  return NextResponse.json({
    id: created.id,
    brand: source.company ?? "unknown",
    lastFour,
    expMonth,
    expYear,
  });
}
