import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { BudgetSummary } from "@/models/budgets";

export const useBudgetSummary = (budgetId?: number) => {
  const { user } = useAuth();

  return useQuery<BudgetSummary[]>({
    queryKey: ["budget-summary", user?.id, budgetId],
    queryFn: async () => {
      let query = supabase
        .from("budget_summary")
        .select(`*`)
        .eq("user_id", user?.id);

      if (budgetId) {
        query = query.eq("budget_id", budgetId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Failed to fetch budget summary", error);
        throw error;
      }
      return data;
    },
    enabled: !!user,
  });
};