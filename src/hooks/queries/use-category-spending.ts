import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { MOVEMENT_TYPES } from "@/constants/enums";

export interface CategorySpendingItem {
  categoryId: number | null;
  categoryName: string;
  total: number;
}

export interface CategoryTransaction {
  id: number;
  date: string;
  description: string | null;
  categoryName: string;
  amount: number;
  originalAmount: number;
  currencyCode: string | null;
  currencySymbol: string | null;
}

export interface CategorySpendingResult {
  expenseCategories: CategorySpendingItem[];
  transactionsByExpenseCategory: Record<string, CategoryTransaction[]>;
  incomeCategories: CategorySpendingItem[];
  transactionsByIncomeCategory: Record<string, CategoryTransaction[]>;
}

interface MovementRow {
  id: number | null;
  date: string | null;
  description: string | null;
  amount: number | null;
  exchange_rate: number | null;
  category_id: number | null;
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
    let query = supabase
      .from("money_movements")
      .select("id, date, description, amount, exchange_rate, category_id, category_name, currency_code, currency_symbol")
      .eq("user_id", userId)
      .eq("resource_type", resourceType)
      .not("id", "is", null)
      .gte("date", startDate)
      .lte("date", endDate)
      .range(from, from + BATCH_SIZE - 1);

    if (resourceType === MOVEMENT_TYPES.TRANSACTION) {
      query = query.not("category_id", "is", null);
    }

    const { data, error } = await query;

    if (error) throw error;

    const batch = (data as unknown as MovementRow[]) ?? [];
    allData.push(...batch);

    if (batch.length < BATCH_SIZE) break;

    from += BATCH_SIZE;
  }

  return allData;
}

export const useCategorySpending = (
  startDate: string,
  endDate: string,
  resourceType: string = MOVEMENT_TYPES.TRANSACTION
): UseQueryResult<CategorySpendingResult> => {
  const { user } = useAuth();

  return useQuery<CategorySpendingResult>({
    queryKey: ["category_spending", user?.id, startDate, endDate, resourceType],
    queryFn: async (): Promise<CategorySpendingResult> => {
      if (!user?.id) {
        return {
          expenseCategories: [],
          transactionsByExpenseCategory: {},
          incomeCategories: [],
          transactionsByIncomeCategory: {},
        };
      }

      const data = await fetchAllMovements(user.id, startDate, endDate, resourceType);

      const expenseTotals = new Map<string, { id: number | null; total: number }>();
      const incomeTotals = new Map<string, { id: number | null; total: number }>();
      const transactionsByExpenseCategory: Record<string, CategoryTransaction[]> = {};
      const transactionsByIncomeCategory: Record<string, CategoryTransaction[]> = {};

      for (const mv of data) {
        const catName = mv.category_name ?? "Tanpa Kategori";
        const catId = mv.category_id ?? null;
        const rawAmount = mv.amount ?? 0;
        const baseAmount = Math.abs(rawAmount * (mv.exchange_rate ?? 0));
        const tx: CategoryTransaction = {
          id: mv.id ?? 0,
          date: mv.date ?? "",
          description: mv.description,
          categoryName: catName,
          amount: baseAmount,
          originalAmount: Math.abs(rawAmount),
          currencyCode: mv.currency_code,
          currencySymbol: mv.currency_symbol,
        };

        if (rawAmount < 0) {
          const existing = expenseTotals.get(catName) ?? { id: catId, total: 0 };
          existing.total += baseAmount;
          expenseTotals.set(catName, existing);
          if (!transactionsByExpenseCategory[catName]) transactionsByExpenseCategory[catName] = [];
          transactionsByExpenseCategory[catName].push(tx);
        } else if (rawAmount > 0) {
          const existing = incomeTotals.get(catName) ?? { id: catId, total: 0 };
          existing.total += baseAmount;
          incomeTotals.set(catName, existing);
          if (!transactionsByIncomeCategory[catName]) transactionsByIncomeCategory[catName] = [];
          transactionsByIncomeCategory[catName].push(tx);
        }
      }

      for (const catName of Object.keys(transactionsByExpenseCategory)) {
        transactionsByExpenseCategory[catName].sort((a, b) => b.date.localeCompare(a.date));
      }
      for (const catName of Object.keys(transactionsByIncomeCategory)) {
        transactionsByIncomeCategory[catName].sort((a, b) => b.date.localeCompare(a.date));
      }

      const toSortedItems = (map: Map<string, { id: number | null; total: number }>): CategorySpendingItem[] =>
        Array.from(map.entries())
          .map(([categoryName, { id, total }]) => ({ categoryId: id, categoryName, total }))
          .sort((a, b) => b.total - a.total);

      return {
        expenseCategories: toSortedItems(expenseTotals),
        transactionsByExpenseCategory,
        incomeCategories: toSortedItems(incomeTotals),
        transactionsByIncomeCategory,
      };
    },
    enabled: !!user && !!startDate && !!endDate,
  });
};
