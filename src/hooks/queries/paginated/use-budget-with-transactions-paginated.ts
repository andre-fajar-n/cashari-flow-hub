import { usePaginatedSupabase, PaginatedParams } from "@/hooks/queries/paginated/use-paginated-supabase";

export const useBudgetWithTransactionsPaginatedByBudgetId = (budgetId: number, params: PaginatedParams) => {
  return usePaginatedSupabase(params, {
    queryKeyBase: "budgets_with_transactions_paginated",
    table: "budget_item_with_transactions",
    select: `*`,
    orderBy: [
      { column: "date", ascending: false },
      { column: "created_at", ascending: false },
    ],
    mapSearch: (q: any, term: string) => q.or(`wallet_name.ilike.%${term},category_name.ilike.%${term},description.ilike.%${term}%`),
    mapFilters: (q: any, filters: Record<string, any>) => {
      Object.entries(filters).forEach(([key, value]) => {
        if (!value && value !== 0) return;
        if (key === 'start_date' || key === 'end_date') {
          q = q.eq(key, value);
        } else {
          q = q.eq(key, value);
        }
      });
      q = q.eq('budget_id', budgetId);
      return q;
    },
  });
};