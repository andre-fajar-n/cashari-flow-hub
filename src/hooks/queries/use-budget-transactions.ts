import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { BudgetItemWithTransactions } from "@/models/budget-transactions";

export const useBudgetTransactionsByBudgetId = (budgetId: number) => {
  const { user } = useAuth();

  return useQuery<BudgetItemWithTransactions[]>({
    queryKey: ["budget-transactions-by-budget-id", budgetId],
    queryFn: async (): Promise<BudgetItemWithTransactions[]> => {
      let queryBuilder = supabase
        .from("budget_item_with_transactions")
        .select("*")
        .eq("budget_id", budgetId)
        .order("date", { ascending: false })
        .order("id", { ascending: false });

      const { data, error } = await queryBuilder;
      if (error) {
        console.error("Failed to fetch budget transactions", error);
        throw error;
      }
      return (data || []) as BudgetItemWithTransactions[];
    },
    enabled: !!user,
  });
};

export const useCreateBudgetItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ budgetId, transactionIds }: { budgetId: number; transactionIds: number[] }) => {
      const budgetItems = transactionIds.map(transactionId => ({
        budget_id: budgetId,
        transaction_id: transactionId
      }));

      const { error } = await supabase
        .from("budget_items")
        .insert(budgetItems);

      if (error) {
        console.error("Failed to add transactions to budget", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgets_with_transactions_paginated"] });
      queryClient.invalidateQueries({ queryKey: ["budget-summary"] });
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil ditambahkan ke budget",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal menambahkan transaksi ke budget",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteBudgetItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ budgetId, transactionId }: { budgetId: number; transactionId: number }) => {
      const { error } = await supabase
        .from("budget_items")
        .delete()
        .eq("budget_id", budgetId)
        .eq("transaction_id", transactionId);

      if (error) {
        console.error("Failed to remove transaction from budget", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgets_with_transactions_paginated"] });
      queryClient.invalidateQueries({ queryKey: ["budget-summary"] });
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil dihapus dari budget",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal menghapus transaksi dari budget",
        variant: "destructive",
      });
    },
  });
};
