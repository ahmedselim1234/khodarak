import "server-only";
import { serverEnv } from "@/lib/env.server";

const MOYASAR_API_BASE = "https://api.moyasar.com/v1";

function authHeader() {
  const encoded = Buffer.from(`${serverEnv.MOYASAR_SECRET_KEY}:`).toString("base64");
  return `Basic ${encoded}`;
}

export type MoyasarPaymentSource =
  | { type: "token"; token: string }
  | { type: "creditcard"; token: string };

export type MoyasarPayment = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  source?: {
    type: string;
    company?: string;
    name?: string;
    number?: string; // masked, e.g. "xxxx-xxxx-xxxx-1234"
    token?: string; // present on a save_only payment's source (Phase 6 card replacement)
    month?: string | number;
    year?: string | number;
    transaction_url?: string;
  };
  [key: string]: unknown;
};

// The only module that calls Moyasar's REST API — createPayment (US1's
// /pay route) and fetchPayment (US2's callback route, the authoritative
// status lookup FR-005 requires). Basic Auth with the secret key is all
// Moyasar's REST API requires; no SDK dependency for two HTTP calls
// (plan.md, research.md).
export async function createPayment(params: {
  amountHalalas: number;
  token: string;
  callbackUrl: string;
  subscriptionId: string;
}): Promise<MoyasarPayment> {
  const response = await fetch(`${MOYASAR_API_BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amountHalalas,
      currency: "SAR",
      description: `Khodarak — subscription ${params.subscriptionId}`,
      source: { type: "token", token: params.token },
      callback_url: params.callbackUrl,
      metadata: { subscription_id: params.subscriptionId },
    }),
  });

  if (!response.ok) {
    throw new Error(`Moyasar createPayment failed: ${response.status}`);
  }

  return (await response.json()) as MoyasarPayment;
}

// Phase 7's unattended renewal charge — deliberately no callback_url and no
// explicit 3ds field, mirroring plan.md §3b's own documented example
// verbatim (research.md §2): there is no browser present to redirect, and
// an already-verified saved token defaults to 3DS off. Distinct from
// createPayment (which always sets callback_url for the customer's own 3DS
// redirect) rather than overloading one function with an optional
// parameter that would silently change its meaning.
export async function createRecurringPayment(params: {
  amountHalalas: number;
  token: string;
  subscriptionId: string;
  cycleNumber: number;
}): Promise<MoyasarPayment> {
  const response = await fetch(`${MOYASAR_API_BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amountHalalas,
      currency: "SAR",
      description: `Khodarak — subscription ${params.subscriptionId} renewal cycle ${params.cycleNumber}`,
      source: { type: "token", token: params.token },
      metadata: { subscription_id: params.subscriptionId, cycle_number: params.cycleNumber },
    }),
  });

  if (!response.ok) {
    throw new Error(`Moyasar createRecurringPayment failed: ${response.status}`);
  }

  return (await response.json()) as MoyasarPayment;
}

export async function fetchPayment(paymentId: string): Promise<MoyasarPayment> {
  const response = await fetch(`${MOYASAR_API_BASE}/payments/${paymentId}`, {
    headers: { Authorization: authHeader() },
  });

  if (!response.ok) {
    throw new Error(`Moyasar fetchPayment failed: ${response.status}`);
  }

  return (await response.json()) as MoyasarPayment;
}
