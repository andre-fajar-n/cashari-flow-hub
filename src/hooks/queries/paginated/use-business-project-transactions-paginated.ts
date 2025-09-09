import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface UseBusinessProjectTransactionsPaginatedParams {
  projectId: number;
  page: number;
  itemsPerPage: number;
  searchTerm?: string;
  filters?: Record<string, any>;
}

export const useBusinessProjectTransactionsPaginated = ({
  projectId,
  page,
  itemsPerPage,
  searchTerm = "",
  filters = {}
}: UseBusinessProjectTransactionsPaginatedParams) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["business-project-transactions-paginated", projectId, page, itemsPerPage, searchTerm, filters],
    queryFn: async () => {
      if (!projectId) return { data: [], count: 0 };

      const offset = (page - 1) * itemsPerPage;

      // Build the query
      let query = supabase
        .from("business_project_transactions")
        .select(`
          *,
          transactions!inner(
            *,
            categories(name, is_income),
            wallets(name, currency_code)
          )
        `, { count: 'exact' })
        .eq("project_id", projectId);

      // Apply search filter
      if (searchTerm) {
        query = query.or(`transactions.description.ilike.%${searchTerm}%,transactions.amount::text.ilike.%${searchTerm}%`);
      }

      // Apply column filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (key === "date") {
            // Handle date range filter
            if (typeof value === "object" && value.from) {
              query = query.gte(`transactions.${key}`, value.from);
              if (value.to) {
                query = query.lte(`transactions.${key}`, value.to);
              }
            } else {
              query = query.eq(`transactions.${key}`, value);
            }
          } else if (key === "category_id") {
            query = query.eq(`transactions.${key}`, value);
          } else if (key === "wallet_id") {
            query = query.eq(`transactions.${key}`, value);
          } else if (key === "is_income") {
            query = query.eq(`transactions.categories.${key}`, value === "true");
          } else {
            query = query.eq(`transactions.${key}`, value);
          }
        }
      });

      // Apply pagination and ordering
      query = query
        .order("created_at", { ascending: false, referencedTable: "transactions" })
        .range(offset, offset + itemsPerPage - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error("Failed to fetch paginated business project transactions", error);
        throw error;
      }

      return {
        data: data || [],
        count: count || 0
      };
    },
    enabled: !!user && !!projectId,
  });
};
