import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const useGoalFundsSummary = (goalId?: number, assetId?: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["goal_funds_summary", user?.id, goalId, assetId],
    queryFn: async () => {
      let query = supabase
        .from("fund_summary")
        .select(`
          goal_id,
          currency_code,
          wallet_id,
          total_amount,
          total_amount_unit,
          asset_id,
          instrument_id,
          goal_name,
          instrument_name,
          asset_name,
          asset_symbol,
          unit_label,
          wallet_name
        `)
        .eq("user_id", user?.id);

        if (goalId) {
          query = query.eq("goal_id", goalId);
        }

        if (assetId) {
          query = query.eq("asset_id", assetId);
        }

        const { data: fundSummary, error: error } = await query;

      if (error) {
        console.error("Failed to fetch goal funds summary", error);
        throw error;
      }

      return fundSummary;
    },
    enabled: !!user,
  });
};
