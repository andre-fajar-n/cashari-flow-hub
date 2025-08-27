import { usePaginatedSupabase, PaginatedParams } from "@/hooks/queries/paginated/use-paginated-supabase";

export const useDebtsPaginated = (params: PaginatedParams) =>
  usePaginatedSupabase(params, {
    queryKeyBase: "debts_paginated",
    table: "debts",
    select: `*`,
    orderBy: { column: "name", ascending: true },
    mapSearch: (q: any, term: string) => q.ilike("name", `%${term}%`),
    mapFilters: (q: any, filters: Record<string, any>) => {
      Object.entries(filters).forEach(([key, value]) => {
        if (!value && value !== 0) return;
        if (key === 'due_date') {
          q = q.eq('due_date', value);
        } else {
          q = q.eq(key, value);
        }
      });
      return q;
    },
  });

