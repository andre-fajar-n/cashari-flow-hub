import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export const useBudgetTransactions = (budgetId?: number) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["budget-transactions", budgetId],
    queryFn: async () => {
      if (!budgetId) return [];

      const { data, error } = await supabase
        .from("budget_items")
        .select(`
          *,
          transactions!inner(
            *,
            categories(name, is_income),
            wallets(name, currency_code)
          )
        `)
        .eq("budget_id", budgetId);

      if (error) {
        console.error("Failed to fetch budget transactions", error);
        throw error;
      }
      return data;
    },
    enabled: !!user && !!budgetId,
  });

  const addTransactionsToBudget = useMutation({
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

  const removeTransactionFromBudget = useMutation({
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

  return {
    ...query,
    addTransactionsToBudget,
    removeTransactionFromBudget
  };
};
