import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

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
}

export interface CategorySpendingResult {
  categories: CategorySpendingItem[];
  transactionsByCategory: Record<string, CategoryTransaction[]>;
}

interface TransactionRow {
  id: number;
  date: string;
  description: string | null;
  amount: number;
  categories: {
    id: number;
    name: string;
    is_income: boolean;
    application: string | null;
  } | null;
}

const BATCH_SIZE = 1000;

async function fetchAllTransactions(
  userId: string,
  startDate: string,
  endDate: string
): Promise<TransactionRow[]> {
  const allData: TransactionRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("transactions")
      .select("id, date, description, amount, categories(id, name, is_income, application)")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .range(from, from + BATCH_SIZE - 1);

    if (error) throw error;

    const batch = (data as unknown as TransactionRow[]) ?? [];
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

      const data = await fetchAllTransactions(user.id, startDate, endDate);

      const categoryTotals = new Map<
        string,
        { id: number | null; total: number }
      >();
      const transactionsByCategory: Record<string, CategoryTransaction[]> = {};

      for (const tx of data) {
        const cat = tx.categories;

        // Exclude transactions without a category — classification unknown
        if (!cat) continue;
        // Exclude investment/debt categories; only count regular expense transactions
        if (cat.application && cat.application !== "transaction") continue;
        if (cat.is_income) continue;

        const catName = cat?.name ?? "Tanpa Kategori";
        const catId = cat?.id ?? null;

        const existing = categoryTotals.get(catName) ?? { id: catId, total: 0 };
        existing.total += tx.amount ?? 0;
        categoryTotals.set(catName, existing);

        if (!transactionsByCategory[catName]) {
          transactionsByCategory[catName] = [];
        }
        transactionsByCategory[catName].push({
          id: tx.id,
          date: tx.date,
          description: tx.description,
          categoryName: catName,
          amount: tx.amount,
        });
      }

      // Sort each category's transactions by date descending
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
