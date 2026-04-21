import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO, addMonths, addDays, addYears, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { id } from "date-fns/locale";
import { MOVEMENT_TYPES } from "@/constants/enums";

export interface CashFlowMonthItem {
  month: string;      // "Jan 2025" format using date-fns id locale
  yearMonth: string;  // "2025-01" for sorting
  income: number;
  expense: number;
  net: number;
}

interface MovementRow {
  date: string | null;
  amount: number | null;
  exchange_rate: number | null;
}

const BATCH_SIZE = 1000;

async function fetchAllMovements(
  userId: string,
  startDate: string,
  endDate: string,
  resourceType: string
): Promise<MovementRow[]> {
  const allData: MovementRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("money_movements")
      .select("date, amount, exchange_rate")
      .eq("user_id", userId)
      .eq("resource_type", resourceType)
      .gte("date", startDate)
      .lte("date", endDate)
      .range(from, from + BATCH_SIZE - 1);

    if (error) throw error;

    const batch = (data as MovementRow[]) ?? [];
    allData.push(...batch);

    if (batch.length < BATCH_SIZE) break;

    from += BATCH_SIZE;
  }

  return allData;
}

export const useCashFlowTrend = (
  startDate: string,
  endDate: string,
  granularity: "daily" | "monthly" | "yearly" = "monthly",
  resourceType: string = MOVEMENT_TYPES.TRANSACTION
): UseQueryResult<CashFlowMonthItem[]> => {
  const { user } = useAuth();

  return useQuery<CashFlowMonthItem[]>({
    queryKey: ["cashflow_trend", user?.id, startDate, endDate, granularity, resourceType],
    queryFn: async (): Promise<CashFlowMonthItem[]> => {
      if (!user?.id) return [];

      const movements = await fetchAllMovements(user.id, startDate, endDate, resourceType)

      const periodMap = new Map<string, { income: number; expense: number }>();

      for (const mv of movements) {
        if (!mv.date) continue;

        const baseAmount = (mv.amount ?? 0) * (mv.exchange_rate ?? 1);

        let periodKey: string;
        if (granularity === "daily") {
          periodKey = mv.date.slice(0, 10);
        } else if (granularity === "yearly") {
          periodKey = mv.date.slice(0, 4);
        } else {
          periodKey = mv.date.slice(0, 7);
        }

        const existing = periodMap.get(periodKey) ?? { income: 0, expense: 0 };

        if (mv.amount > 0) {
          existing.income += baseAmount;
        } else {
          existing.expense += baseAmount;
        }

        periodMap.set(periodKey, existing);
      }

      // Generate all periods in range, filling zeros for periods with no data
      const allPeriods: CashFlowMonthItem[] = [];

      periodMap.forEach((value, key) => {
        periodMap.set(key, { income: value.income, expense: Math.abs(value.expense) });
      });

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
