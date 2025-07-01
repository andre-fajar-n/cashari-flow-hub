
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useGoalFundsSummary = (goalId: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["goal_funds_summary", user?.id, goalId],
    queryFn: async () => {
      // Get summary from goal transfers (incoming)
      const { data: transferSummary, error: transferError } = await supabase
        .from("goal_transfers")
        .select(`
          amount_to,
          currency_to,
          to_instrument_id,
          to_asset_id,
          investment_instruments!goal_transfers_to_instrument_id_fkey(name),
          investment_assets!goal_transfers_to_asset_id_fkey(name, symbol)
        `)
        .eq("user_id", user?.id)
        .eq("to_goal_id", goalId);

      if (transferError) throw transferError;

      // Get summary from goal investment records
      const { data: recordSummary, error: recordError } = await supabase
        .from("goal_investment_records")
        .select(`
          amount,
          currency_code,
          instrument_id,
          asset_id,
          investment_instruments!goal_investment_records_instrument_id_fkey(name),
          investment_assets!goal_investment_records_asset_id_fkey(name, symbol)
        `)
        .eq("user_id", user?.id)
        .eq("goal_id", goalId)
        .eq("is_valuation", false);

      if (recordError) throw recordError;

      // Process and group the data
      const fundMap = new Map();

      // Process transfers
      transferSummary?.forEach((transfer) => {
        const instrumentName = (transfer.investment_instruments as any)?.name || null;
        const assetName = (transfer.investment_assets as any)?.name || null;
        const assetSymbol = (transfer.investment_assets as any)?.symbol || null;
        
        const key = `${instrumentName || 'cash'}-${assetName || 'none'}`;
        
        if (fundMap.has(key)) {
          const existing = fundMap.get(key);
          existing.total_amount += transfer.amount_to;
          existing.source_count += 1;
        } else {
          fundMap.set(key, {
            instrument_name: instrumentName,
            asset_name: assetName,
            asset_symbol: assetSymbol,
            total_amount: transfer.amount_to,
            currency_code: transfer.currency_to,
            source_count: 1,
          });
        }
      });

      // Process records
      recordSummary?.forEach((record) => {
        const instrumentName = (record.investment_instruments as any)?.name || null;
        const assetName = (record.investment_assets as any)?.name || null;
        const assetSymbol = (record.investment_assets as any)?.symbol || null;
        
        const key = `${instrumentName || 'cash'}-${assetName || 'none'}`;
        
        if (fundMap.has(key)) {
          const existing = fundMap.get(key);
          existing.total_amount += record.amount;
          existing.source_count += 1;
        } else {
          fundMap.set(key, {
            instrument_name: instrumentName,
            asset_name: assetName,
            asset_symbol: assetSymbol,
            total_amount: record.amount,
            currency_code: record.currency_code,
            source_count: 1,
          });
        }
      });

      return Array.from(fundMap.values()).sort((a, b) => b.total_amount - a.total_amount);
    },
    enabled: !!user && !!goalId,
  });
};
