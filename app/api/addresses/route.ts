import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addressCreateSchema } from "@/lib/validation/address";
import { formatZodFieldErrors } from "@/lib/validation/formatZodError";
import { shouldAutoDefault } from "@/lib/addresses/defaultInvariant";
import { mapAddressRow } from "@/lib/addresses/mapAddressRow";

const ADDRESS_SELECT =
  "id, label, city_id, district, street_details, is_default, created_at, cities(name_ar)";

// GET/POST /api/addresses — per contracts/addresses-api.md. Every query is
// additionally scoped by RLS (user_id = auth.uid()) beneath this handler's
// own filtering — Constitution Principle V, RLS as the authorization
// boundary, not just an app-layer check.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("addresses")
    .select(ADDRESS_SELECT)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  return NextResponse.json({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase's generated row type for a joined select isn't inferred without generated DB types (out of scope this phase); mapAddressRow's own parameter type is the actual contract.
    addresses: (data ?? []).map((row: any) => mapAddressRow(row)),
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = addressCreateSchema.safeParse(body);

  if (!result.success) {
    return formatZodFieldErrors(result.error);
  }

  const { count } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const isDefault = shouldAutoDefault(count ?? 0);

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      label: result.data.label,
      city_id: result.data.cityId,
      district: result.data.district,
      street_details: result.data.streetDetails,
      is_default: isDefault,
    })
    .select(ADDRESS_SELECT)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see GET's note above
  return NextResponse.json({ address: mapAddressRow(data as any) }, { status: 201 });
}
