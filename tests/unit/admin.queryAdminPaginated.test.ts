import { describe, expect, it, vi } from "vitest";
import { queryAdminPaginated } from "@/lib/admin/queryAdminPaginated";

// Mirrors the mock shape queryAdminOrders/Payments/Subscriptions previously
// each built independently — a Supabase query builder whose chained methods
// return `this` until `.range()` resolves the promise.
function createMockSupabase(rows: unknown[], count: number) {
  const calls: Record<string, unknown[]> = {};
  const builder: Record<string, unknown> = {};

  for (const method of ["select", "order", "eq", "gte", "lte", "or"]) {
    builder[method] = vi.fn((...args: unknown[]) => {
      calls[method] = args;
      return builder;
    });
  }

  builder.range = vi.fn(() => Promise.resolve({ data: rows, count }));

  const from = vi.fn(() => builder);
  return { supabase: { from }, builder, calls };
}

describe("queryAdminPaginated", () => {
  it("paginates using PAGE_SIZE-sized ranges", async () => {
    const { supabase, builder } = createMockSupabase([], 0);

    await queryAdminPaginated({
      supabase: supabase as never,
      table: "orders",
      select: "id, status",
      page: 2,
      pageSize: 20,
      filters: [],
      search: null,
      searchColumns: [],
    });

    expect(builder.range).toHaveBeenCalledWith(20, 39);
  });

  it("applies each eq filter passed in", async () => {
    const { supabase, calls } = createMockSupabase([], 0);

    await queryAdminPaginated({
      supabase: supabase as never,
      table: "orders",
      select: "id, status",
      page: 1,
      pageSize: 20,
      filters: [{ column: "status", value: "pending" }],
      search: null,
      searchColumns: [],
    });

    expect(calls.eq).toEqual(["status", "pending"]);
  });

  it("builds an OR ilike filter across the given search columns when a search term is present", async () => {
    const { supabase, calls } = createMockSupabase([], 0);

    await queryAdminPaginated({
      supabase: supabase as never,
      table: "orders",
      select: "id, status, profiles(full_name, email, phone)",
      page: 1,
      pageSize: 20,
      filters: [],
      search: "ahmed",
      searchColumns: ["full_name", "email", "phone"],
      searchReferencedTable: "profiles",
    });

    expect(calls.or).toEqual([
      "full_name.ilike.%ahmed%,email.ilike.%ahmed%,phone.ilike.%ahmed%",
      { referencedTable: "profiles" },
    ]);
  });

  it("returns the rows and total count unchanged, for the caller to map", async () => {
    const rows = [{ id: "1" }, { id: "2" }];
    const { supabase } = createMockSupabase(rows, 2);

    const result = await queryAdminPaginated({
      supabase: supabase as never,
      table: "orders",
      select: "id",
      page: 1,
      pageSize: 20,
      filters: [],
      search: null,
      searchColumns: [],
    });

    expect(result).toEqual({ data: rows, totalCount: 2 });
  });
});
