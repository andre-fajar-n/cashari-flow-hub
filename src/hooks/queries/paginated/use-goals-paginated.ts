import { usePaginatedSupabase, PaginatedParams } from "@/hooks/queries/paginated/use-paginated-supabase";

export const useGoalsPaginated = (params: PaginatedParams) =>
  usePaginatedSupabase(params, {
    queryKeyBase: "goals_paginated",
    table: "goals",
    select: `*`,
    orderBy: [
      { column: "name", ascending: true },
    ],
    mapSearch: (q: any, term: string) => q.ilike("name", `%${term}%`),
    mapFilters: (q: any, filters: Record<string, any>) => {
      Object.entries(filters).forEach(([key, value]) => {
        if (!value && value !== 0) return;
        if (key === 'target_date') {
          q = q.eq('target_date', value);
        } else if (key === 'target_amount') {
          q = q.gte('target_amount', value);
        } else {
          q = q.eq(key, value);
        }
      });
      return q;
    },
  });

