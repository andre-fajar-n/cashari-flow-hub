import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { MoneySummaryFilter } from "@/form-dto/money-summary";
import { MoneySummaryModel } from "@/models/money-summary";

export const useMoneySummary = (filter?: MoneySummaryFilter) => {
  const { user } = useAuth();

  return useQuery<MoneySummaryModel[]>({
    queryKey: ["money_summary", user?.id, filter],
    queryFn: async () => {
      let query = supabase
        .from("money_summary")
        .select('*')
        .eq("user_id", user?.id);

      if (filter?.walletId) {
        query = query.eq("wallet_id", filter.walletId);
      }

      if (filter?.goalId) {
        query = query.eq("goal_id", filter.goalId);
      }

      if (filter?.instrumentId) {
        query = query.eq("instrument_id", filter.instrumentId);
      }

      if (filter?.assetId) {
        query = query.eq("asset_id", filter.assetId);
      }

      if (filter?.investmentOnly) {
        query = query.not("goal_id", "is", null);
      }

      const { data: fundSummary, error: error } = await query;
      if (error) {
        console.error("Failed to fetch money summary", error);
        throw error;
      }

      return fundSummary;
    },
    enabled: !!user,
  });
};
