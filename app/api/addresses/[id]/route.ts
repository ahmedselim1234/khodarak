import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addressUpdateSchema } from "@/lib/validation/address";
import { formatZodFieldErrors } from "@/lib/validation/formatZodError";
import { mapAddressRow } from "@/lib/addresses/mapAddressRow";

const ADDRESS_SELECT =
  "id, label, city_id, district, street_details, is_default, created_at, cities(name_ar)";

// PATCH/DELETE /api/addresses/[id] — per contracts/addresses-api.md. Scoped
// to the owner by both the explicit `user_id` filter below and RLS
// underneath it; a row that exists but belongs to another user returns 404,
// never confirming its existence (Constitution Principle V).
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = addressUpdateSchema.safeParse(body);

  if (!result.success) {
    return formatZodFieldErrors(result.error);
  }

  const { data: existing } = await supabase
    .from("addresses")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { label, cityId, district, streetDetails, isDefault } = result.data;

  if (isDefault) {
    // Unset-previous-then-set-new transaction (research.md, data-model.md).
    // The partial unique index (supabase/migrations) is the backstop that
    // still holds this invariant under a concurrent request.
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("is_default", true)
      .neq("id", id);
  }

  const { data, error } = await supabase
    .from("addresses")
    .update({
      ...(label !== undefined && { label }),
      ...(cityId !== undefined && { city_id: cityId }),
      ...(district !== undefined && { district }),
      ...(streetDetails !== undefined && { street_details: streetDetails }),
      ...(isDefault !== undefined && { is_default: isDefault }),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select(ADDRESS_SELECT)
    .single();

  if (error || !data) {
    console.error("[PATCH /api/addresses/:id] update failed", { userId: user.id, addressId: id, error });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase's generated row type for a joined select isn't inferred without generated DB types (out of scope this phase); mapAddressRow's own parameter type is the actual contract.
  return NextResponse.json({ address: mapAddressRow(data as any) });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  // Phase 6 FR-019 amendment (contracts/settings-api.md): block deleting an
  // address that's load-bearing for a non-cancelled subscription, either as
  // its current or its pending delivery address. Phase 1 predates
  // subscriptions existing at all, so this couldn't have been anticipated
  // in the original contract — an app-layer guard in front of the
  // otherwise-unchanged owner-scoped RLS DELETE policy.
  const { data: inUse } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .neq("status", "cancelled")
    .or(`address_id.eq.${id},pending_address_id.eq.${id}`)
    .limit(1)
    .maybeSingle();

  if (inUse) {
    return NextResponse.json({ error: "address_in_use" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[DELETE /api/addresses/:id] delete failed", { userId: user.id, addressId: id, error });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // No auto-promotion of another address to default (data-model.md State
  // Transitions) — nothing further to do here.
  return new NextResponse(null, { status: 204 });
}
