import { usePaginatedSupabase, PaginatedParams } from "@/hooks/queries/paginated/use-paginated-supabase";

interface UseBusinessProjectTransactionsPaginatedParams extends PaginatedParams {
  projectId: number;
}

export const useBusinessProjectTransactionsPaginated = ({
  projectId,
  page,
  itemsPerPage,
  searchTerm = "",
  filters = {}
}: UseBusinessProjectTransactionsPaginatedParams) => {
  return usePaginatedSupabase({ page, itemsPerPage, searchTerm, filters }, {
    queryKeyBase: "business-project-transactions-paginated",
    table: "business_project_transactions",
    select: `*,
      transactions!inner(
        *,
        categories(name, is_income),
        wallets(name, currency_code)
      )`,
    orderBy: [
      { column: "date", ascending: false, referencedTable: "transactions" },
      { column: "created_at", ascending: false, referencedTable: "transactions" }
    ],
    includeUserId: false, // business_project_transactions has user_id but we filter by project_id instead
    baseFilters: (q: any) => q.eq("project_id", projectId),
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
    enabled: !!projectId,
  });
};
