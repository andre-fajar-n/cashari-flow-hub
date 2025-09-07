import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface PaginatedParams {
  page: number;
  itemsPerPage: number;
  searchTerm?: string;
  filters?: Record<string, any>;
}

export interface OrderByOption {
  column: string;
  ascending?: boolean;
}

export interface PaginatedOptions {
  queryKeyBase: string;
  table: string;
  select: string;
  orderBy?: OrderByOption | OrderByOption[];
  includeUserId?: boolean; // default true
  userIdColumn?: string; // default 'user_id'
  baseFilters?: (q: any) => any;
  mapSearch?: (q: any, term: string) => any;
  mapFilters?: (q: any, filters: Record<string, any>) => any;
  enabled?: boolean;
}

export const usePaginatedSupabase = <T = any>(params: PaginatedParams, options: PaginatedOptions) => {
  const { user } = useAuth();
  const { page, itemsPerPage, searchTerm = "", filters = {} } = params;

  return useQuery<{ data: T[]; count: number }>({
    queryKey: [
      options.queryKeyBase,
      user?.id,
      page,
      itemsPerPage,
      searchTerm,
      filters,
    ],
    queryFn: async () => {
      if (!user) return { data: [], count: 0 } as { data: T[]; count: number };

      // Use 'any' to allow dynamic table names with typed Supabase client
      let query: any = (supabase.from as any)(options.table)
        .select(options.select, { count: "exact" });

      if (options.includeUserId !== false) {
        const userIdColumn = options.userIdColumn || "user_id";
        query = query.eq(userIdColumn, user.id);
      }

      if (options.baseFilters) {
        query = options.baseFilters(query);
      }

      if (options.orderBy) {
        // Handle multiple order by columns
        if (Array.isArray(options.orderBy)) {
          options.orderBy.forEach((orderOption) => {
            query = query.order(orderOption.column, { ascending: orderOption.ascending ?? false });
          });
        } else {
          // Handle single order by column (backward compatibility)
          query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? false });
        }
      }

      // paging
      query = query.range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      if (searchTerm && options.mapSearch) {
        query = options.mapSearch(query, searchTerm);
      }

      if (filters && options.mapFilters) {
        query = options.mapFilters(query, filters);
      }

      const { data, count, error } = await query;
      if (error) {
        console.error("Failed to fetch paginated data", error);
        throw error;
      }
      return { data: (data || []) as T[], count: count || 0 };
    },
    placeholderData: keepPreviousData,
    enabled: !!user && (options.enabled ?? true),
  });
};

