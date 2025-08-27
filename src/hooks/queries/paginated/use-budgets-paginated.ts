import { usePaginatedSupabase, PaginatedParams } from "@/hooks/queries/paginated/use-paginated-supabase";

export const useBudgetsPaginated = (params: PaginatedParams) =>
  usePaginatedSupabase(params, {
    queryKeyBase: "budgets_paginated",
    table: "budgets",
    select: `*`,
    orderBy: { column: "name", ascending: true },
    mapSearch: (q: any, term: string) => q.ilike("name", `%${term}%`),
    mapFilters: (q: any, filters: Record<string, any>) => {
      Object.entries(filters).forEach(([key, value]) => {
        if (!value && value !== 0) return;
        if (key === 'start_date' || key === 'end_date') {
          q = q.eq(key, value);
        } else if (key === 'amount') {
          q = q.gte('amount', value);
        } else {
          q = q.eq(key, value);
        }
      });
      return q;
    },
  });

