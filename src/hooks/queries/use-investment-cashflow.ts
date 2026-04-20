import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { MOVEMENT_TYPES } from "@/constants/enums";

export interface InvestmentCashFlowSummary {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
}

const BATCH_SIZE = 1000;

async function fetchInvestmentMovements(
  userId: string,
  startDate: string,
  endDate: string
): Promise<{ amount: number | null; exchange_rate: number | null }[]> {
  const allData: { amount: number | null; exchange_rate: number | null }[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("money_movements")
      .select("amount, exchange_rate")
      .eq("user_id", userId)
      .eq("resource_type", MOVEMENT_TYPES.INVESTMENT_GROWTH)
      .gte("date", startDate)
      .lte("date", endDate)
      .range(from, from + BATCH_SIZE - 1);

    if (error) throw error;

    const batch = data ?? [];
    allData.push(...batch);

    if (batch.length < BATCH_SIZE) break;
    from += BATCH_SIZE;
  }

  return allData;
}

export const useInvestmentCashFlow = (
  startDate: string,
  endDate: string
): UseQueryResult<InvestmentCashFlowSummary> => {
  const { user } = useAuth();

  return useQuery<InvestmentCashFlowSummary>({
    queryKey: ["investment_cashflow", user?.id, startDate, endDate],
    queryFn: async (): Promise<InvestmentCashFlowSummary> => {
      if (!user?.id) return { totalIncome: 0, totalExpense: 0, netCashFlow: 0 };

      const movements = await fetchInvestmentMovements(user.id, startDate, endDate)

      let totalIncome = 0;
      let totalExpense = 0;

      for (const mv of movements) {
        const convertedAmount = (mv.amount ?? 0) * (mv.exchange_rate ?? 0);

        if (convertedAmount > 0) {
          totalIncome += convertedAmount;
        } else {
          totalExpense += convertedAmount;
        }
      }

      totalExpense = Math.abs(totalExpense);

      return { totalIncome, totalExpense, netCashFlow: totalIncome - totalExpense };
    },
    enabled: !!user && !!startDate && !!endDate,
  });
};
