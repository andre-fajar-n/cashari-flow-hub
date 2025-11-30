import { usePaginatedSupabase, PaginatedParams } from "@/hooks/queries/paginated/use-paginated-supabase";

export const useInvestmentAssetValuesPaginated = (params: PaginatedParams) => {
  return usePaginatedSupabase(params, {
    queryKeyBase: "investment_asset_values_paginated",
    table: "investment_asset_values",
    select: `*,
      investment_assets!inner(
        name,
        symbol
      )`,
    orderBy: [
      { column: "date", ascending: false },
    ],
    mapSearch: (q: any, term: string) => {
      if (!term) return q;
      const isNumeric = /^\d+(?:\.\d+)?$/.test(term);
      if (isNumeric) {
        return q.eq("value", term);
      }
      return q;
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
          } else if (key === "asset_id") {
            q = q.eq("asset_id", value);
          } else {
            q = q.eq(key, value);
          }
        }
      });
      return q;
    },
  });
};

export const useInvestmentAssetValuesPaginatedByAsset = (assetId: number, params: PaginatedParams) => {
  return useInvestmentAssetValuesPaginated({
    ...params,
    filters: {
      ...params.filters,
      asset_id: assetId
    }
  });
};

