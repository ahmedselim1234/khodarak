import { createClient } from "@/lib/supabase/server";
import { AddressBook } from "@/components/address/AddressBook";

// Server Component: reads the active city list via the server Supabase
// client (FR-016 — only active cities are offered for new/edited
// addresses). The address list itself is owned by AddressBook's RTK Query
// cache on the client, since the create/edit/delete/default mutations live
// there too and RTK Query's tag invalidation keeps the list in sync
// automatically after each mutation, without a manual page refresh.
// StoreProvider now wraps the whole app (app/layout.tsx, added in Phase 2
// for the cart) so this component no longer needs its own.
export async function AddressList() {
  const supabase = await createClient();
  const { data: cities } = await supabase
    .from("cities")
    .select("id, name_ar")
    .eq("is_active", true)
    .order("name_ar");

  const cityOptions = (cities ?? []).map((city) => ({ id: city.id, nameAr: city.name_ar }));

  return <AddressBook cities={cityOptions} />;
}
