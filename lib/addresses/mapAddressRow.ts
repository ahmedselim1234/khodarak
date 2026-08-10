type AddressRow = {
  id: string;
  label: string;
  city_id: string;
  district: string;
  street_details: string;
  is_default: boolean;
  created_at: string;
  cities: { name_ar: string } | { name_ar: string }[] | null;
};

// Maps a Supabase row (snake_case, joined city name) to the camelCase shape
// documented in contracts/addresses-api.md.
export function mapAddressRow(row: AddressRow) {
  const city = Array.isArray(row.cities) ? row.cities[0] : row.cities;

  return {
    id: row.id,
    label: row.label,
    cityId: row.city_id,
    cityName: city?.name_ar ?? "",
    district: row.district,
    streetDetails: row.street_details,
    isDefault: row.is_default,
    createdAt: row.created_at,
  };
}
