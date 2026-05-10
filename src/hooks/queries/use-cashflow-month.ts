import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { fetchAllRows } from "@/integrations/supabase/batch-fetch";

export interface CashFlowMonthResult {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
}

export const useCashFlowMonth = () => {
  const { user } = useAuth();
  const today = new Date();
  const startDate = format(startOfMonth(today), "yyyy-MM-dd");
  const endDate = format(endOfMonth(today), "yyyy-MM-dd");

  return useQuery<CashFlowMonthResult>({
    queryKey: ["cashflow_month", user?.id, startDate],
    queryFn: async () => {
      if (!user?.id) return { totalIncome: 0, totalExpense: 0, netCashFlow: 0 };

      const txRows = await fetchAllRows(
        supabase.from("transactions")
          .select("amount, categories(is_income, application)")
          .eq("user_id", user.id)
          .gte("date", startDate)
          .lte("date", endDate)
          .order("id", { ascending: true })
      );

      let totalIncome = 0;
      let totalExpense = 0;

      for (const tx of txRows) {
        const cat = tx.categories as any;
        // Only count regular transactions — exclude investment/debt categories
        if (cat?.application && cat.application !== 'transaction') continue;
        if (cat?.is_income) {
          totalIncome += tx.amount || 0;
        } else {
          totalExpense += tx.amount || 0;
        }
      }

      return {
        totalIncome,
        totalExpense,
        netCashFlow: totalIncome - totalExpense,
      };
    },
    enabled: !!user,
  });
};
