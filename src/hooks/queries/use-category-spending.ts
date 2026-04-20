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
  categories: CategorySpendingItem[];
  transactionsByCategory: Record<string, CategoryTransaction[]>;
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
  endDate: string
): Promise<MovementRow[]> {
  const allData: MovementRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("money_movements")
      .select("id, date, description, amount, exchange_rate, category_id, category_name, currency_code, currency_symbol")
      .eq("user_id", userId)
      .eq("resource_type", MOVEMENT_TYPES.TRANSACTION)
      .lt("amount", 0)
      .not("id", "is", null)
      .not("category_id", "is", null)
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

export const useCategorySpending = (
  startDate: string,
  endDate: string
): UseQueryResult<CategorySpendingResult> => {
  const { user } = useAuth();

  return useQuery<CategorySpendingResult>({
    queryKey: ["category_spending", user?.id, startDate, endDate],
    queryFn: async (): Promise<CategorySpendingResult> => {
      if (!user?.id) {
        return { categories: [], transactionsByCategory: {} };
      }

      const data = await fetchAllMovements(user.id, startDate, endDate);

      const categoryTotals = new Map<
        string,
        { id: number | null; total: number }
      >();
      const transactionsByCategory: Record<string, CategoryTransaction[]> = {};

      for (const mv of data) {
        const catName = mv.category_name ?? "Tanpa Kategori";
        const catId = mv.category_id ?? null;
        const baseAmount = Math.abs((mv.amount ?? 0) * (mv.exchange_rate ?? 0));

        const existing = categoryTotals.get(catName) ?? { id: catId, total: 0 };
        existing.total += baseAmount;
        categoryTotals.set(catName, existing);

        if (!transactionsByCategory[catName]) {
          transactionsByCategory[catName] = [];
        }
        transactionsByCategory[catName].push({
          id: mv.id ?? 0,
          date: mv.date ?? "",
          description: mv.description,
          categoryName: catName,
          amount: baseAmount,
          originalAmount: Math.abs(mv.amount ?? 0),
          currencyCode: mv.currency_code,
          currencySymbol: mv.currency_symbol,
        });
      }

      for (const catName of Object.keys(transactionsByCategory)) {
        transactionsByCategory[catName].sort((a, b) =>
          b.date.localeCompare(a.date)
        );
      }

      const categories: CategorySpendingItem[] = Array.from(
        categoryTotals.entries()
      )
        .map(([categoryName, { id, total }]) => ({
          categoryId: id,
          categoryName,
          total,
        }))
        .sort((a, b) => b.total - a.total);

      return { categories, transactionsByCategory };
    },
    enabled: !!user && !!startDate && !!endDate,
  });
};
