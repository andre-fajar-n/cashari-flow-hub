
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const useGoalFundsSummary = (goalId: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["goal_funds_summary", user?.id, goalId],
    queryFn: async () => {
      const { data: fundSummary, error: error } = await supabase
        .from("fund_summary")
        .select(`
          total_amount,
          currency_code,
          instrument_name,
          asset_name,
          asset_symbol,
          total_amount_unit,
          unit_label
        `)
        .eq("user_id", user?.id)
        .eq("goal_id", goalId);

      if (error) {
        throw error
      };

      return fundSummary;
    },
    enabled: !!user && !!goalId,
  });
};
