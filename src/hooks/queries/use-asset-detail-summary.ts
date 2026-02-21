import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { InvestmentSummaryExtended } from "@/hooks/queries/use-goal-detail-summary";

export interface AssetDetailSummary {
  // Aggregated values in original currency
  investedCapital: number;
  activeCapital: number;
  currentValue: number;
  totalProfit: number;
  roi: number | null;
  originalCurrencyCode: string;

  // Base currency aggregates (for multi-currency comparison)
  investedCapitalBaseCurrency: number;
  activeCapitalBaseCurrency: number;
  currentValueBaseCurrency: number;
  totalProfitBaseCurrency: number;
  baseCurrencyCode: string;

  // Profit breakdown
  realizedProfit: number;
  realizedProfitBaseCurrency: number;
  unrealizedProfit: number;
  unrealizedAssetProfit: number;
  unrealizedCurrencyProfit: number;
  unrealizedProfitPercentage: number | null;

  // Trackable indicator
  isTrackable: boolean;

  // Raw data for breakdown
  items: InvestmentSummaryExtended[];
}

export const useAssetDetailSummary = (assetId: number) => {
  const { user } = useAuth();

  return useQuery<AssetDetailSummary>({
    queryKey: ["asset_detail_summary", assetId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("money_summary")
        .select("*")
        .eq("asset_id", assetId);

      if (error) {
        console.error("Failed to fetch asset detail summary", error);
        throw error;
      }

      const items = (data || []) as unknown as InvestmentSummaryExtended[];

      // Aggregate values
      let investedCapital = 0;
      let activeCapital = 0;
      let currentValue = 0;
      let totalProfit = 0;
      let investedCapitalBaseCurrency = 0;
      let activeCapitalBaseCurrency = 0;
      let currentValueBaseCurrency = 0;
      let totalProfitBaseCurrency = 0;
      let realizedProfit = 0;
      let realizedProfitBaseCurrency = 0;
      let unrealizedProfit = 0;
      let unrealizedAssetProfit = 0;
      let unrealizedCurrencyProfit = 0;
      let originalCurrencyCode = "";
      let baseCurrencyCode = "";
      let isTrackable = false;

      for (const item of items) {
        investedCapital += item.invested_capital || 0;
        activeCapital += item.active_capital || 0;
        currentValue += item.current_value || 0;
        totalProfit += item.total_profit || 0;
        investedCapitalBaseCurrency += item.invested_capital_base_currency || 0;
        activeCapitalBaseCurrency += item.active_capital_base_currency || 0;
        currentValueBaseCurrency += item.current_value_base_currency || 0;
        totalProfitBaseCurrency += item.total_profit_base_currency || 0;
        realizedProfit += item.realized_profit || 0;
        realizedProfitBaseCurrency += item.realized_profit_base_currency || 0;
        unrealizedProfit += item.unrealized_profit || 0;

        // Unrealized breakdown
        if (item.unrealized_asset_profit_base_currency != null) {
          unrealizedAssetProfit += item.unrealized_asset_profit_base_currency;
          isTrackable = true;
        }
        if (item.unrealized_currency_profit != null) {
          unrealizedCurrencyProfit += item.unrealized_currency_profit;
        }

        if (item.original_currency_code && !originalCurrencyCode) {
          originalCurrencyCode = item.original_currency_code;
        }
        if (item.base_currency_code && !baseCurrencyCode) {
          baseCurrencyCode = item.base_currency_code;
        }
      }

      // ROI = Total Profit / Invested Capital (NOT Active Capital)
      const roi = investedCapitalBaseCurrency > 0
        ? (totalProfitBaseCurrency / investedCapitalBaseCurrency) * 100
        : null;

      // Unrealized ROI = Unrealized Profit / Active Capital (using original currency)
      const unrealizedProfitPercentage = activeCapital > 0
        ? (unrealizedProfit / activeCapital) * 100
        : null;

      return {
        investedCapital,
        activeCapital,
        currentValue,
        totalProfit,
        roi,
        originalCurrencyCode,
        investedCapitalBaseCurrency,
        activeCapitalBaseCurrency,
        currentValueBaseCurrency,
        totalProfitBaseCurrency,
        baseCurrencyCode,
        realizedProfit,
        realizedProfitBaseCurrency,
        unrealizedProfit,
        unrealizedAssetProfit,
        unrealizedCurrencyProfit,
        unrealizedProfitPercentage,
        isTrackable,
        items,
      };
    },
    enabled: !!user && !!assetId,
  });
};
