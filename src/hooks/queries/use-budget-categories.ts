import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const useBudgetCategories = (budgetId?: number) => {
  const { user } = useAuth();

  return useQuery<number[]>({
    queryKey: ["budget-categories", user?.id, budgetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget_categories")
        .select("category_id")
        .eq("user_id", user?.id)
        .eq("budget_id", budgetId!);

      if (error) throw error;
      return (data || []).map((row) => row.category_id);
    },
    enabled: !!user && !!budgetId,
  });
};

export const useSyncBudgetCategories = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ budgetId, categoryIds }: { budgetId: number; categoryIds: number[] }) => {
      // Delete existing
      await supabase
        .from("budget_categories")
        .delete()
        .eq("user_id", user?.id)
        .eq("budget_id", budgetId);

      if (categoryIds.length === 0) return;

      // Insert new
      const { error } = await supabase.from("budget_categories").insert(
        categoryIds.map((catId) => ({
          budget_id: budgetId,
          category_id: catId,
          user_id: user?.id,
        }))
      );

      if (error) throw error;
    },
    onSuccess: (_data, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: ["budget-categories", user?.id, budgetId] });
    },
  });
};
