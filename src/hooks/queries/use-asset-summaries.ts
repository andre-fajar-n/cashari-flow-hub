import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AssetSummaryData } from "@/models/money-summary";

export const useAssetSummaries = () => {
  const { user } = useAuth();

  return useQuery<AssetSummaryData[]>({
    queryKey: ["asset_summaries", user?.id],
    queryFn: async () => {
      // Get money summary data for assets only (where asset_id is not null)
      const { data: moneySummaries, error } = await supabase
        .from("money_summary")
        .select('*')
        .eq("user_id", user?.id)
        .not("asset_id", "is", null);

      if (error) {
        console.error("Failed to fetch asset summaries", error);
        throw error;
      }

      // Group by asset_id and aggregate the data
      const assetMap = new Map<number, AssetSummaryData>();

      for (const summary of moneySummaries) {
        const assetId = summary.asset_id!;
        const existing = assetMap.get(assetId);

        if (existing) {
          // Aggregate amounts and units
          existing.totalAmount += summary.amount || 0;
          existing.totalAmountUnit += summary.amount_unit || 0;

          // Keep the latest asset value and date (assuming data is already sorted or we pick the most recent)
          if (summary.latest_asset_value_date &&
              (!existing.latestAssetValueDate || summary.latest_asset_value_date > existing.latestAssetValueDate)) {
            existing.latestAssetValue = summary.latest_asset_value;
            existing.latestAssetValueDate = summary.latest_asset_value_date;
          }
        } else {
          // Create new entry
          const totalAmount = summary.amount || 0;
          const totalAmountUnit = summary.amount_unit || 0;

          assetMap.set(assetId, {
            assetId,
            assetName: summary.asset_name || `Asset ${assetId}`,
            latestAssetValue: summary.latest_asset_value,
            latestAssetValueDate: summary.latest_asset_value_date,
            totalAmount,
            totalAmountUnit,
            currencyCode: summary.original_currency_code || 'IDR',
            averagePricePerUnit: null,
            currentAssetAmount: null,
            amountChange: null,
            amountChangePercentage: null,
            assetValueChange: null,
            assetValueChangePercentage: null,
            unrealizedAmount: null,
          });
        }
      }

      // Recalculate all derived values for aggregated data
      const result = Array.from(assetMap.values()).map(asset => {
        const averagePricePerUnit = asset.totalAmountUnit > 0 ? asset.totalAmount / asset.totalAmountUnit : null;
        const currentAssetAmount = asset.latestAssetValue && asset.totalAmountUnit > 0
          ? asset.latestAssetValue * asset.totalAmountUnit
          : null;

        const amountChange = currentAssetAmount !== null ? currentAssetAmount - asset.totalAmount : null;
        const amountChangePercentage = amountChange !== null && asset.totalAmount > 0
          ? (amountChange / asset.totalAmount) * 100
          : null;

        const assetValueChange = asset.latestAssetValue && averagePricePerUnit
          ? asset.latestAssetValue - averagePricePerUnit
          : null;
        const assetValueChangePercentage = assetValueChange !== null && averagePricePerUnit && averagePricePerUnit > 0
          ? (assetValueChange / averagePricePerUnit) * 100
          : null;

        return {
          ...asset,
          averagePricePerUnit,
          currentAssetAmount,
          amountChange,
          amountChangePercentage,
          assetValueChange,
          assetValueChangePercentage,
          unrealizedAmount: amountChange, // Same as amountChange (profit/loss)
        };
      });

      return result;
    },
    enabled: !!user,
  });
};
