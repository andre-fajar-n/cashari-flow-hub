import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { MOVEMENT_TYPES } from "@/constants/enums";

export interface CashFlowPeriodTransaction {
  id: number;
  date: string;
  description: string | null;
  categoryName: string;
  amount: number;
  originalAmount: number;
  currencyCode: string | null;
  currencySymbol: string | null;
}

export interface CashFlowPeriodData {
  income: CashFlowPeriodTransaction[];
  expense: CashFlowPeriodTransaction[];
}

interface MovementRow {
  id: number | null;
  date: string | null;
  description: string | null;
  amount: number | null;
  exchange_rate: number | null;
  category_name: string | null;
  currency_code: string | null;
  currency_symbol: string | null;
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
      .select("id, date, description, amount, exchange_rate, category_name, currency_code, currency_symbol")
      .eq("user_id", userId)
      .eq("resource_type", resourceType)
      .not("id", "is", null)
      .gte("date", startDate)
      .lte("date", endDate)
      .range(from, from + BATCH_SIZE - 1);

    if (error) throw error;

    const batch = (data as unknown as MovementRow[]) ?? [];
    allData.push(...batch);

    if (batch.length < BATCH_SIZE) break;
    from += BATCH_SIZE;
  }

  return allData;
}

export const useCashFlowTransactionsByPeriod = (
  startDate: string,
  endDate: string,
  granularity: "daily" | "monthly" | "yearly",
  resourceType: string = MOVEMENT_TYPES.TRANSACTION
): UseQueryResult<Record<string, CashFlowPeriodData>> => {
  const { user } = useAuth();

  return useQuery<Record<string, CashFlowPeriodData>>({
    queryKey: ["cashflow_transactions_by_period", user?.id, startDate, endDate, granularity, resourceType],
    queryFn: async (): Promise<Record<string, CashFlowPeriodData>> => {
      if (!user?.id) return {};

      const rows = await fetchAllMovements(user.id, startDate, endDate, resourceType);
      const result: Record<string, CashFlowPeriodData> = {};

      for (const mv of rows) {
        if (!mv.date || mv.id === null) continue;

        let periodKey: string;
        if (granularity === "daily") {
          periodKey = mv.date.slice(0, 10);
        } else if (granularity === "yearly") {
          periodKey = mv.date.slice(0, 4);
        } else {
          periodKey = mv.date.slice(0, 7);
        }

        if (!result[periodKey]) {
          result[periodKey] = { income: [], expense: [] };
        }

        const rawAmount = mv.amount ?? 0;
        const baseAmount = Math.abs(rawAmount * (mv.exchange_rate ?? 1));
        const tx: CashFlowPeriodTransaction = {
          id: mv.id,
          date: mv.date,
          description: mv.description,
          categoryName: mv.category_name ?? "Tanpa Kategori",
          amount: baseAmount,
          originalAmount: Math.abs(rawAmount),
          currencyCode: mv.currency_code,
          currencySymbol: mv.currency_symbol,
        };

        if (rawAmount > 0) {
          result[periodKey].income.push(tx);
        } else if (rawAmount < 0) {
          result[periodKey].expense.push(tx);
        }
      }

      for (const key of Object.keys(result)) {
        result[key].income.sort((a, b) => b.date.localeCompare(a.date));
        result[key].expense.sort((a, b) => b.date.localeCompare(a.date));
      }

      return result;
    },
    enabled: !!user && !!startDate && !!endDate,
  });
};
