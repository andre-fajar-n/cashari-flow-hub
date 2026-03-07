import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DailyCumulative } from "@/models/daily-cumulative";
import { getStatus, ValuationStatus } from "@/lib/balance-trend";

export interface ValuationDetail {
  asset_id: string;
  asset_name: string;
  units: number;
  price: number | null;
  price_date: string | null;
  fx_rate: number | null;
  fx_date: string | null;
  status: ValuationStatus;
  original_currency_code: string;
  is_trackable: boolean;
}

export const useValuationDetail = (date: string | null) => {
  return useQuery<ValuationDetail[]>({
    queryKey: ["valuation_detail", date],
    queryFn: async () => {
      if (!date) return [];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("daily_cumulative")
        .select("*")
        .eq("user_id", user.id)
        .eq("movement_date", date);

      if (error) {
        console.error("Error fetching valuation details:", error);
        throw error;
      }

      // Step 1: Basic filtering and aggregation
      // Group by asset_id and original_currency_code to sum units
      const aggregated = (data || []).reduce((acc: Record<string, DailyCumulative>, item: DailyCumulative) => {
        const key = `${item.asset_id || 'null'}-${item.original_currency_code}`;
        if (!acc[key]) {
          acc[key] = { ...item, cumulative_unit: 0 };
        }
        acc[key].cumulative_unit += (item.cumulative_unit || 0);
        return acc;
      }, {});

      const processedRows = Object.values(aggregated);

      // Step 2: Identify currencies that are already represented by a specific asset
      const currenciesWithAssets = new Set(
        processedRows
          .filter((item: DailyCumulative) => item.asset_id && item.is_trackable)
          .map((item: DailyCumulative) => item.original_currency_code)
      );

      // Step 3: Final filtering and mapping
      return processedRows
        .filter((item: DailyCumulative) => {
          // Rule A: Basic relevance
          const isRelevant = item.is_trackable
            ? (item.cumulative_unit || 0) > 0
            : (item.original_currency_code !== item.base_currency_code && (item.cumulative_amount || 0) > 0);

          if (!isRelevant) return false;

          // Rule B: Hide null-asset rows if currency already represented by a trackable asset
          if (!item.asset_id && currenciesWithAssets.has(item.original_currency_code)) {
            return false;
          }

          return true;
        })
        .map((item: DailyCumulative) => {
          // Calculate status for this asset
          const status = getStatus(item, date);

          return {
            asset_id: item.asset_id?.toString() || '',
            asset_name: item.asset_name || item.original_currency_code || 'Unnamed Asset',
            units: item.cumulative_unit || 0,
            price: item.historical_asset_price,
            price_date: item.asset_price_date_used,
            fx_rate: item.historical_fx_rate,
            fx_date: item.fx_rate_date_used,
            status,
            original_currency_code: item.original_currency_code || '',
            is_trackable: !!item.is_trackable
          };
        })
        .sort((a, b) => a.asset_name.localeCompare(b.asset_name));
    },
    enabled: !!date,
  });
};
