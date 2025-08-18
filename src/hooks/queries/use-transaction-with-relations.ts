import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { TransactionFormData } from "@/form-dto/transactions";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useInsertTransactionWithRelations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (transaction: TransactionFormData) => {
      const { data, error } = await supabase
        .rpc("insert_transaction_with_relations", {
          _amount: transaction.amount,
          _budget_ids: transaction.budget_ids,
          _category_id: parseInt(transaction.category_id),
          _description: transaction.description,
          _project_ids: transaction.business_project_ids,
          _trx_date: transaction.date,
          _user_id: user?.id,
          _wallet_id: parseInt(transaction.wallet_id),
        });

      if (error) {
        console.error("Failed to insert transaction with relations", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil ditambahkan",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal menyimpan transaksi",
        description: "Terjadi kesalahan saat menyimpan data. Error: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTransactionWithRelations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...transaction }: TransactionFormData & { id: number }) => {
      const { data, error } = await supabase
        .rpc("update_transaction_with_relations", {
          _transaction_id: id,
          _user_id: user?.id,
          _wallet_id: parseInt(transaction.wallet_id),
          _category_id: parseInt(transaction.category_id),
          _amount: transaction.amount,
          _trx_date: transaction.date,
          _description: transaction.description,
          _budget_ids: transaction.budget_ids,
          _project_ids: transaction.business_project_ids,
        });

      if (error) {
        console.error("Failed to update transaction with relations", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil diperbarui",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal menyimpan transaksi",
        description: "Terjadi kesalahan saat menyimpan data. Error: " + error.message,
        variant: "destructive",
      });
    },
  });
};
