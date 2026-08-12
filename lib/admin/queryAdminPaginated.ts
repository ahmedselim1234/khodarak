import type { createClient } from "@/lib/supabase/server";

// Shared paginated/searchable Supabase query builder — extracted from the
// ~90%-identical bodies of queryAdminOrders.ts/queryAdminPayments.ts/
// queryAdminSubscriptions.ts (Phase 11, research.md §1.1). Each of those
// three files stays the typed, table-specific call site; this helper owns
// only the mechanical part every one of them repeated: applying eq filters,
// an OR-across-columns search, and range-based pagination.
export type QueryAdminPaginatedFilter = {
  column: string;
  operator?: "eq" | "gte" | "lte";
  value: string;
};

export type QueryAdminPaginatedParams = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  table: string;
  select: string;
  page: number;
  pageSize: number;
  filters: QueryAdminPaginatedFilter[];
  search: string | null;
  searchColumns: string[];
  searchReferencedTable?: string;
  orderBy?: { column: string; ascending?: boolean }[];
};

export async function queryAdminPaginated<T = unknown>(
  params: QueryAdminPaginatedParams
): Promise<{ data: T[]; totalCount: number }> {
  const {
    supabase,
    table,
    select,
    page,
    pageSize,
    filters,
    search,
    searchColumns,
    searchReferencedTable,
    orderBy,
  } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the Supabase query builder's chained-method return type isn't expressible generically across every table this helper is used against.
  let request: any = supabase.from(table).select(select, { count: "exact" });

  for (const { column, ascending } of orderBy ?? []) {
    request = request.order(column, { ascending: ascending ?? false });
  }

  for (const filter of filters) {
    const operator = filter.operator ?? "eq";
    request = request[operator](filter.column, filter.value);
  }

  if (search && searchColumns.length > 0) {
    const orExpression = searchColumns.map((column) => `${column}.ilike.%${search}%`).join(",");
    request = request.or(
      orExpression,
      searchReferencedTable ? { referencedTable: searchReferencedTable } : undefined
    );
  }

  const from = (page - 1) * pageSize;
  const { data, count } = await request.range(from, from + pageSize - 1);

  return { data: (data ?? []) as T[], totalCount: count ?? 0 };
}
