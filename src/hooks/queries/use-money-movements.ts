import { MoneyMovementFilter } from "@/form-dto/money-movements";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useMoneyMovements = (filter?: MoneyMovementFilter) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["money_movements", user?.id, filter],
    queryFn: async () => {
      let query = supabase
        .from("money_movements")
        .select(`
          *
        `)
        .eq("user_id", user?.id);

      if (filter?.goalId) {
        query = query.eq("goal_id", filter.goalId);
      }

      if (filter?.walletId) {
        query = query.eq("wallet_id", filter.walletId);
      }

      if (filter?.instrumentId) {
        query = query.eq("instrument_id", filter.instrumentId);
      }

      if (filter?.assetId) {
        query = query.eq("asset_id", filter.assetId);
      }

      if (filter?.startDate) {
        query = query.gte("date", filter.startDate);
      }

      if (filter?.endDate) {
        query = query.lte("date", filter.endDate);
      }

      const { data, error } = await query.order("date", { ascending: false });

      if (error) {
        console.error("Failed to fetch money movements", error);
        throw error;
      }
      return data;
    },
    enabled: !!user,
  });
};