import { usePaginatedSupabase, PaginatedParams } from "@/hooks/queries/paginated/use-paginated-supabase";

export const useBusinessProjectsPaginated = (params: PaginatedParams) =>
  usePaginatedSupabase(params, {
    queryKeyBase: "business_projects_paginated",
    table: "business_projects",
    select: `*`,
    orderBy: { column: "name", ascending: true },
    mapSearch: (q: any, term: string) => q.ilike("name", `%${term}%`),
    mapFilters: (q: any, filters: Record<string, any>) => {
      Object.entries(filters).forEach(([key, value]) => {
        if (!value && value !== 0) return;
        q = q.eq(key, value);
      });
      return q;
    },
  });

