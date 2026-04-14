import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO, addMonths, addDays, addYears, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { id } from "date-fns/locale";
import { Database } from "@/integrations/supabase/types";

export interface CashFlowMonthItem {
  month: string;      // "Jan 2025" format using date-fns id locale
  yearMonth: string;  // "2025-01" for sorting
  income: number;
  expense: number;
  net: number;
}

interface TransactionWithCategory {
  date: string;
  amount: number | null;
  categories: {
    is_income: boolean | null;
    application: Database["public"]["Enums"]["category_application"] | null;
  } | null;
}

const BATCH_SIZE = 1000;

async function fetchAllTransactions(
  userId: string,
  startDate: string,
  endDate: string
): Promise<TransactionWithCategory[]> {
  const allData: TransactionWithCategory[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("transactions")
      .select("date, amount, categories(is_income, application)")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .range(from, from + BATCH_SIZE - 1);

    if (error) throw error;

    const batch = (data as unknown as TransactionWithCategory[]) ?? [];
    allData.push(...batch);

    // If fewer rows returned than batch size, we've fetched everything
    if (batch.length < BATCH_SIZE) break;

    from += BATCH_SIZE;
  }

  return allData;
}

export const useCashFlowTrend = (
  startDate: string,
  endDate: string,
  granularity: "daily" | "monthly" | "yearly" = "monthly"
): UseQueryResult<CashFlowMonthItem[]> => {
  const { user } = useAuth();

  return useQuery<CashFlowMonthItem[]>({
    queryKey: ["cashflow_trend", user?.id, startDate, endDate, granularity],
    queryFn: async (): Promise<CashFlowMonthItem[]> => {
      if (!user?.id) return [];

      const transactions = await fetchAllTransactions(user.id, startDate, endDate);

      const periodMap = new Map<string, { income: number; expense: number }>();

      for (const tx of transactions) {
        const cat = tx.categories;
        // Exclude transactions without a category — we can't classify them
        if (!cat) continue;
        // Exclude investment/debt categories
        if (cat.application && cat.application !== "transaction") continue;

        let periodKey: string;
        if (granularity === "daily") {
          periodKey = tx.date.slice(0, 10); // "2025-01-15"
        } else if (granularity === "yearly") {
          periodKey = tx.date.slice(0, 4); // "2025"
        } else {
          periodKey = tx.date.slice(0, 7); // "2025-01"
        }

        const existing = periodMap.get(periodKey) ?? { income: 0, expense: 0 };

        if (cat.is_income === true) {
          existing.income += tx.amount ?? 0;
        } else if (cat.is_income === false) {
          existing.expense += tx.amount ?? 0;
        }

        periodMap.set(periodKey, existing);
      }

      // Generate all periods in range, filling zeros for periods with no data
      const allPeriods: CashFlowMonthItem[] = [];

      if (granularity === "daily") {
        let current = parseISO(startDate);
        const rangeEnd = parseISO(endDate);
        while (current.getTime() <= rangeEnd.getTime()) {
          const periodKey = format(current, "yyyy-MM-dd");
          const { income, expense } = periodMap.get(periodKey) ?? { income: 0, expense: 0 };
          allPeriods.push({
            yearMonth: periodKey,
            month: format(current, "dd MMM", { locale: id }),
            income,
            expense,
            net: income - expense,
          });
          current = addDays(current, 1);
        }
      } else if (granularity === "yearly") {
        let current = startOfYear(parseISO(startDate));
        const rangeEnd = endOfYear(parseISO(endDate));
        while (current.getTime() <= rangeEnd.getTime()) {
          const periodKey = format(current, "yyyy");
          const { income, expense } = periodMap.get(periodKey) ?? { income: 0, expense: 0 };
          allPeriods.push({
            yearMonth: periodKey,
            month: format(current, "yyyy"),
            income,
            expense,
            net: income - expense,
          });
          current = addYears(current, 1);
        }
      } else {
        // monthly
        let current = startOfMonth(parseISO(startDate));
        const rangeEnd = endOfMonth(parseISO(endDate));
        while (current.getTime() <= rangeEnd.getTime()) {
          const yearMonth = format(current, "yyyy-MM");
          const { income, expense } = periodMap.get(yearMonth) ?? { income: 0, expense: 0 };
          allPeriods.push({
            yearMonth,
            month: format(current, "MMM yyyy", { locale: id }),
            income,
            expense,
            net: income - expense,
          });
          current = addMonths(current, 1);
        }
      }

      return allPeriods;
    },
    enabled: !!user && !!startDate && !!endDate,
  });
};
