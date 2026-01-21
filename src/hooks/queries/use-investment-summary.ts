import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { InvestmentSummaryModel, GoalInvestmentSummary } from "@/models/investment-summary";

export const useInvestmentSummary = () => {
  const { user } = useAuth();

  return useQuery<InvestmentSummaryModel[]>({
    queryKey: ["investment_summary", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investment_summary")
        .select("*");

      if (error) {
        console.error("Failed to fetch investment summary", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });
};

export const useGoalInvestmentSummary = () => {
  const { user } = useAuth();

  return useQuery<Record<number, GoalInvestmentSummary>>({
    queryKey: ["goal_investment_summary", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investment_summary")
        .select("*")
        .not("goal_id", "is", null);

      if (error) {
        console.error("Failed to fetch goal investment summary", error);
        throw error;
      }

      // Group by goal_id and aggregate
      const goalMap = new Map<number, GoalInvestmentSummary>();

      for (const item of data || []) {
        if (!item.goal_id) continue;

        const existing = goalMap.get(item.goal_id);
        const investedCapital = item.invested_capital || 0;
        const investedCapitalBaseCurrency = item.invested_capital_base_currency || 0;
        const currentValue = item.current_value || 0;
        const currentValueBaseCurrency = item.current_value_base_currency || 0;
        const totalProfit = item.total_profit || 0;
        const totalProfitBaseCurrency = item.total_profit_base_currency || 0;

        if (existing) {
          existing.invested_capital_base_currency += investedCapitalBaseCurrency;
          existing.current_value_base_currency += currentValueBaseCurrency;
          existing.total_profit_base_currency += totalProfitBaseCurrency;
          // Recalculate ROI after aggregation
          existing.roi = existing.invested_capital_base_currency > 0
            ? (existing.total_profit_base_currency / existing.invested_capital_base_currency) * 100
            : null;
        } else {
          goalMap.set(item.goal_id, {
            goal_id: item.goal_id,
            invested_capital_base_currency: investedCapitalBaseCurrency,
            current_value_base_currency: currentValueBaseCurrency,
            total_profit_base_currency: totalProfitBaseCurrency,
            roi: investedCapitalBaseCurrency > 0 ? (totalProfitBaseCurrency / investedCapitalBaseCurrency) * 100 : null,
            original_currency_code: item.original_currency_code || "",
          });
        }
      }

      // Convert to record
      const result: Record<number, GoalInvestmentSummary> = {};
      goalMap.forEach((value, key) => {
        result[key] = value;
      });

      return result;
    },
    enabled: !!user,
  });
};
