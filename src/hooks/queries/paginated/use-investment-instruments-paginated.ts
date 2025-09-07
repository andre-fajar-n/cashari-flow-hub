import { usePaginatedSupabase, PaginatedParams } from "@/hooks/queries/paginated/use-paginated-supabase";

export const useInvestmentInstrumentsPaginated = (params: PaginatedParams) =>
  usePaginatedSupabase(params, {
    queryKeyBase: "investment_instruments_paginated",
    table: "investment_instruments",
    select: `*`,
    orderBy: [
      { column: "name", ascending: true },
    ],
    mapSearch: (q: any, term: string) => q.ilike("name", `%${term}%`),
    mapFilters: (q: any, filters: Record<string, any>) => {
      Object.entries(filters).forEach(([key, value]) => {
        if (!value && value !== 0) return;
        q = q.eq(key, value);
      });
      return q;
    },
  });

