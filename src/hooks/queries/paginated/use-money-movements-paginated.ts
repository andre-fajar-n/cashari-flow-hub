import { usePaginatedSupabase, PaginatedParams } from "@/hooks/queries/paginated/use-paginated-supabase";

export const useMoneyMovementsPaginated = (params: PaginatedParams) => {
  return usePaginatedSupabase(params, {
    queryKeyBase: "money_movements_paginated",
    table: "money_movements",
    select: `*`,
    orderBy: [
      { column: "date", ascending: false },
      { column: "created_at", ascending: false }
    ],
    mapSearch: (q: any, term: string) => {
      if (!term) return q;
      return q.or(`description.ilike.%${term}%,category_name.ilike.%${term}%,wallet_name.ilike.%${term}%,opposite_wallet_name.ilike.%${term}%,goal_name.ilike.%${term}%,opposite_goal_name.ilike.%${term}%,instrument_name.ilike.%${term}%,opposite_instrument_name.ilike.%${term}%,asset_name.ilike.%${term}%,opposite_asset_name.ilike.%${term}%,budget_names_text.ilike.%${term}%,business_project_names_text.ilike.%${term}%,debt_name.ilike.%${term}%`);
    },
    mapFilters: (q: any, filters: Record<string, any>) => {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (key === "date_from") {
            // Handle date range from
            q = q.gte("date", value);
          } else if (key === "date_to") {
            // Handle date range to
            q = q.lte("date", value);
          } else if (key === "date") {
            // Handle single date or date range object
            if (typeof value === "object" && value.from) {
              q = q.gte("date", value.from);
              if (value.to) {
                q = q.lte("date", value.to);
              }
            } else {
              q = q.eq("date", value);
            }
          } else if (key === "resource_type") {
            q = q.eq("resource_type", value);
          } else if (key === "wallet_id") {
            q = q.eq("wallet_id", value);
          } else if (key === "goal_id") {
            q = q.eq("goal_id", value);
          } else if (key === "instrument_id") {
            q = q.eq("instrument_id", value);
          } else if (key === "asset_id") {
            q = q.eq("asset_id", value);
          } else if (key === "budget_id") {
            q = q.contains("budget_ids", [value]);
          } else if (key === "project_id") {
            q = q.contains("project_ids", [value]);
          } else if (key === "debt_id") {
            q = q.eq("debt_id", value);
          } else if (key === "category_id") {
            q = q.eq("category_id", value);
          } else {
            q = q.eq(key, value);
          }
        }
      });
      return q;
    },
  });
};

export const useMoneyMovementsPaginatedByProject = (projectId: number, params: PaginatedParams) => {
  return useMoneyMovementsPaginated({
    ...params,
    filters: {
      ...params.filters,
      project_id: projectId
    }
  });
};

export const useMoneyMovementsPaginatedByDebt = (debtId: number, params: PaginatedParams) => {
  return useMoneyMovementsPaginated({
    ...params,
    filters: {
      ...params.filters,
      debt_id: debtId
    }
  });
};

export const useMoneyMovementsPaginatedByAsset = (assetId: number, params: PaginatedParams) => {
  return useMoneyMovementsPaginated({
    ...params,
    filters: {
      ...params.filters,
      asset_id: assetId
    }
  });
};
