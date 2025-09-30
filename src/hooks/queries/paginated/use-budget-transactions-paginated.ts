import { usePaginatedSupabase, PaginatedParams } from "@/hooks/queries/paginated/use-paginated-supabase";
import { BudgetItemWithTransactions } from "@/models/budgets";

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
  return usePaginatedSupabase<BudgetItemWithTransactions>({ page, itemsPerPage, searchTerm, filters }, {
    queryKeyBase: "budget-transactions-paginated",
    table: "budget_item_with_transactions",
    select: `*`,
    orderBy: [
      { column: "date", ascending: false }
    ],
    baseFilters: (q: any) => q.eq("budget_id", budgetId),
    mapSearch: (q: any, term: string) => {
      if (!term) return q;
      return q.or(`description.ilike.%${term}%,amount::text.ilike.%${term}%`);
    },
    mapFilters: (q: any, filters: Record<string, any>) => {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (key === "date") {
            // Handle date range filter
            if (typeof value === "object" && value.from) {
              q = q.gte("date", value.from);
              if (value.to) {
                q = q.lte("date", value.to);
              }
            } else {
              q = q.eq("date", value);
            }
          } else if (key === "category_id") {
            q = q.eq("category_id", value);
          } else if (key === "wallet_id") {
            q = q.eq("wallet_id", value);
          } else if (key === "categories.is_income") {
            q = q.eq("categories.is_income", value === "true");
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
