import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { BudgetSummary } from "@/models/budgets";
import { fetchAllRows } from "@/integrations/supabase/batch-fetch";

export const useBudgetSummary = (budgetId?: number) => {
  const { user } = useAuth();

  return useQuery<BudgetSummary[]>({
    queryKey: ["budget-summary", user?.id, budgetId],
    queryFn: async () => {
      let query = supabase
        .from("budget_summary")
        .select(`*`)
        .eq("user_id", user?.id)
        .order("budget_id", { ascending: true });

      if (budgetId) {
        query = query.eq("budget_id", budgetId);
      }

      return fetchAllRows<BudgetSummary>(query as any);
    },
    enabled: !!user,
  });
};