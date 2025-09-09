import { usePaginatedSupabase, PaginatedParams } from "@/hooks/queries/paginated/use-paginated-supabase";

interface UseBudgetTransactionsPaginatedParams extends PaginatedParams {
  budgetId: number;
}

export const useBudgetTransactionsPaginated = ({
  budgetId,
  page,
  itemsPerPage,
  searchTerm = "",
  filters = {}
}: UseBudgetTransactionsPaginatedParams) => {
  return usePaginatedSupabase({ page, itemsPerPage, searchTerm, filters }, {
    queryKeyBase: "budget-transactions-paginated",
    table: "budget_items",
    select: `*,
      transactions!inner(
        *,
        categories(name, is_income),
        wallets(name, currency_code)
      )`,
    orderBy: { column: "date", ascending: false },
    includeUserId: false, // budget_items doesn't have user_id, we filter by budget_id instead
    baseFilters: (q: any) => q.eq("budget_id", budgetId),
    mapSearch: (q: any, term: string) => {
      if (!term) return q;
      return q.or(`transactions.description.ilike.%${term}%,transactions.amount::text.ilike.%${term}%`);
    },
    mapFilters: (q: any, filters: Record<string, any>) => {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (key === "transactions.date") {
            // Handle date range filter
            if (typeof value === "object" && value.from) {
              q = q.gte("transactions.date", value.from);
              if (value.to) {
                q = q.lte("transactions.date", value.to);
              }
            } else {
              q = q.eq("transactions.date", value);
            }
          } else if (key === "transactions.category_id") {
            q = q.eq("transactions.category_id", value);
          } else if (key === "transactions.wallet_id") {
            q = q.eq("transactions.wallet_id", value);
          } else if (key === "transactions.categories.is_income") {
            q = q.eq("transactions.categories.is_income", value === "true");
          } else {
            q = q.eq(key, value);
          }
        }
      });
      return q;
    },
    enabled: !!budgetId,
  });
};
