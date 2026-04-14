import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { BudgetFormData } from "@/form-dto/budget";
import { BudgetModel } from "@/models/budgets";

const syncCategories = async (budgetId: number, categoryIds: number[], userId: string) => {
  await supabase.from("budget_categories").delete().eq("budget_id", budgetId).eq("user_id", userId);
  if (categoryIds.length > 0) {
    await supabase.from("budget_categories").insert(
      categoryIds.map((catId) => ({ budget_id: budgetId, category_id: catId, user_id: userId }))
    );
  }
};

export const useBudgets = () => {
  const { user } = useAuth();

  return useQuery<BudgetModel[]>({
    queryKey: ["budgets", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user?.id)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useBudget = (id: number) => {
  const { user } = useAuth();

  return useQuery<BudgetModel>({
    queryKey: ["budgets", user?.id, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user?.id)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("user_id", user?.id)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("budgets_paginated") });
      toast({
        title: "Berhasil",
        description: "Budget berhasil dihapus",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newBudget: BudgetFormData) => {
      const { category_ids, ...budgetData } = newBudget;

      const { data, error } = await supabase
        .from("budgets")
        .insert({
          ...budgetData,
          user_id: user.id,
          updated_at: null,
        })
        .select("id")
        .single();

      if (error) throw error;
      if (data && category_ids?.length > 0) {
        await syncCategories(data.id, category_ids, user.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("budgets_paginated") });
      queryClient.invalidateQueries({ queryKey: ["budget-categories"] });
      toast({
        title: "Berhasil",
        description: "Budget berhasil ditambahkan",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Gagal menambahkan budget: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...budget }: BudgetFormData & { id: number }) => {
      const { category_ids, ...budgetData } = budget;

      const { error } = await supabase
        .from("budgets")
        .update({
          ...budgetData,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user?.id)
        .eq("id", id);

      if (error) throw error;
      await syncCategories(id, category_ids || [], user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-summary"] });
      queryClient.invalidateQueries({ queryKey: ["budget-categories"] });
      queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("budgets_paginated") });
      toast({
        title: "Berhasil",
        description: "Budget berhasil diperbarui",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Gagal memperbarui budget: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
