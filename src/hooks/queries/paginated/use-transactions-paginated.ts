import { usePaginatedSupabase, PaginatedParams } from "@/hooks/queries/paginated/use-paginated-supabase";

export const useTransactionsPaginated = (params: PaginatedParams) => {
  return usePaginatedSupabase(params, {
    queryKeyBase: "transactions_paginated",
    table: "transactions",
    select: `*,
      categories(id, name, is_income, parent_id, application),
      wallets(id, name, currency_code, initial_amount),
      budget_items(budget_id, budgets(name)),
      business_project_transactions(project_id, business_projects(name))`,
    orderBy: [
      { column: "date", ascending: false },
      { column: "created_at", ascending: false }
    ],
    mapSearch: (q: any, term: string) => {
      if (!term) return q;
      return q.or(`amount.eq.${term},description.ilike.%${term}%`);
    },
    mapFilters: (q: any, filters: Record<string, any>) => {
      Object.entries(filters).forEach(([key, value]) => {
        if (!value && value !== 0) return;
        if (key === 'date') {
          if (typeof value === 'string' && value.includes(',')) {
            const [start, end] = value.split(',');
            q = q.gte('date', start).lte('date', end);
          } else if (typeof value === 'string' && value) {
            q = q.eq('date', value);
          }
        } else {
          q = q.eq(key, value);
        }
      });
      return q;
    },
  });
};

