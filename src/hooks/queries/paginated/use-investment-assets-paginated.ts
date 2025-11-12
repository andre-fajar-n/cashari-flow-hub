import { usePaginatedSupabase, PaginatedParams } from "@/hooks/queries/paginated/use-paginated-supabase";

export const useInvestmentAssetsPaginated = (params: PaginatedParams) => {
  return usePaginatedSupabase(params, {
    queryKeyBase: "investment_assets_paginated",
    table: "investment_assets",
    select: `*, investment_instruments(name)`,
    orderBy: [
      { column: "name", ascending: true },
    ],
    mapSearch: (q: any, term: string) => q.or(`name.ilike.%${term}%,symbol.ilike.%${term}%`),
    mapFilters: (q: any, filters: Record<string, any>) => {
      Object.entries(filters).forEach(([key, value]) => {
        if (!value && value !== 0) return;
        q = q.eq(key, value);
      });
      return q;
    },
  })
}

