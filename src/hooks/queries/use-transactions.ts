import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { TransactionFormData, TransactionFilter } from "@/form-dto/transactions";

export const useTransactions = (filter?: TransactionFilter) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transactions", user?.id, filter],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select(`
          *,
          categories(id, name, is_income, parent_id, application),
          wallets(id, name, currency_code, initial_amount),
          budget_items(
            budget_id,
            budgets(name)
          ),
          business_project_transactions(
            project_id,
            business_projects(name)
          )
        `)
        .eq("user_id", user?.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (filter?.startDate) {
        query = query.gte("date", filter.startDate);
      }

      if (filter?.endDate) {
        query = query.lte("date", filter.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Failed to fetch transactions", error);
        throw error;
      }
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (transaction: TransactionFormData) => {
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: user?.id,
          ...transaction as any,
          updated_at: null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      // Invalidate and refetch paginated transactions queries
      queryClient.invalidateQueries({ queryKey: ["transactions_paginated", user?.id] });
      queryClient.refetchQueries({ queryKey: ["transactions_paginated", user?.id] });
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

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...transaction }: TransactionFormData & { id: number }) => {
      const { data, error } = await supabase
        .from("transactions")
        .update({
          ...(transaction as any),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user?.id)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      // Invalidate and refetch paginated transactions queries
      queryClient.invalidateQueries({ queryKey: ["transactions_paginated", user?.id] });
      queryClient.refetchQueries({ queryKey: ["transactions_paginated", user?.id] });
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

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("user_id", user?.id)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      // Invalidate and refetch paginated transactions queries
      queryClient.invalidateQueries({ queryKey: ["transactions_paginated", user?.id] });
      queryClient.refetchQueries({ queryKey: ["transactions_paginated", user?.id] });
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil dihapus",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Gagal menghapus transaksi: " + error.message,
        variant: "destructive",
      });
    },
  });
};
