import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export interface CashFlowMonthItem {
  month: string;      // "Jan 2025" format using date-fns id locale
  yearMonth: string;  // "2025-01" for sorting
  income: number;
  expense: number;
  net: number;
}

interface TransactionWithCategory {
  date: string;
  amount: number;
  categories: {
    is_income: boolean;
    application: string | null;
  } | null;
}

export const useCashFlowTrend = (
  startDate: string,
  endDate: string
): UseQueryResult<CashFlowMonthItem[]> => {
  const { user } = useAuth();

  return useQuery<CashFlowMonthItem[]>({
    queryKey: ["cashflow_trend", user?.id, startDate, endDate],
    queryFn: async (): Promise<CashFlowMonthItem[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("transactions")
        .select("date, amount, categories(is_income, application)")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate);

      if (error) throw error;

      const monthMap = new Map<string, { income: number; expense: number }>();

      for (const tx of (data as TransactionWithCategory[]) || []) {
        const cat = tx.categories;
        // Exclude transactions without a category — we can't classify them
        if (!cat) continue;
        // Exclude investment/debt categories
        if (cat.application && cat.application !== "transaction") continue;

        const yearMonth = tx.date.slice(0, 7); // "2025-01"
        const existing = monthMap.get(yearMonth) ?? { income: 0, expense: 0 };

        if (cat?.is_income) {
          existing.income += tx.amount ?? 0;
        } else {
          existing.expense += tx.amount ?? 0;
        }

        monthMap.set(yearMonth, existing);
      }

      return Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([yearMonth, { income, expense }]) => ({
          yearMonth,
          month: format(parseISO(`${yearMonth}-01`), "MMM yyyy", { locale: id }),
          income,
          expense,
          net: income - expense,
        }));
    },
    enabled: !!user && !!startDate && !!endDate,
  });
};
