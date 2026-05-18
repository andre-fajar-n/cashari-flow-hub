import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { TransactionFormData, TransactionFilter } from "@/form-dto/transactions";
import { TransactionModel } from "@/models/transactions";
import { checkUnusualSpending } from "@/hooks/use-auto-detect-unusual-spending";
import { fetchAllRows } from "@/integrations/supabase/batch-fetch";

export const useTransactions = (filter?: TransactionFilter) => {
  const { user } = useAuth();

  return useQuery<TransactionModel[]>({
    queryKey: ["transactions", user?.id, filter],
    queryFn: async (): Promise<TransactionModel[]> => {
      let query = supabase
        .from("transactions")
        .select(`
          *,
          categories(id, name, is_income, parent_id, application),
          wallets(id, name, currency_code, currencies(symbol)),
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

      if (filter?.ids) {
        query = query.in("id", filter.ids);
      }

      return fetchAllRows<TransactionModel>(
        query.order("id", { ascending: true }) as any
      );
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
      // Invalidate and refetch paginated transactions queries
      queryClient.invalidateQueries({ queryKey: ["transactions_paginated", user?.id] });
      queryClient.refetchQueries({ queryKey: ["transactions_paginated", user?.id] });
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil ditambahkan",
      });
      // Auto-detect unusual spending for expense transactions
      if (user?.id && variables.category_id && variables.amount < 0) {
        checkUnusualSpending({
          userId: user.id,
          categoryId: parseInt(variables.category_id),
          amount: Math.abs(variables.amount),
        });
      }
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
      queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
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
      queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
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

export interface BulkTransactionUpdateData {
  category_id?: string | null;
  wallet_id?: string | null;
  date?: string | null;
  description?: string | null;
}

export const useBulkUpdateTransactions = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ids, data }: { ids: number[]; data: BulkTransactionUpdateData }) => {
      const payload: Record<string, any> = { updated_at: new Date().toISOString() };
      if (data.category_id) payload.category_id = parseInt(data.category_id);
      if (data.wallet_id) payload.wallet_id = parseInt(data.wallet_id);
      if (data.date) payload.date = data.date;
      if (data.description) payload.description = data.description;

      const { error } = await supabase
        .from("transactions")
        .update(payload)
        .in("id", ids)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: (_, { ids }) => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
      queryClient.invalidateQueries({ queryKey: ["transactions_paginated", user?.id] });
      toast({
        title: "Berhasil",
        description: `${ids.length} transaksi berhasil diperbarui`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal memperbarui transaksi",
        description: "Terjadi kesalahan: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useBulkDeleteTransactions = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .in("id", ids)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
      queryClient.invalidateQueries({ queryKey: ["transactions_paginated", user?.id] });
      toast({
        title: "Berhasil",
        description: `${ids.length} transaksi berhasil dihapus`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menghapus transaksi",
        description: "Terjadi kesalahan: " + error.message,
        variant: "destructive",
      });
    },
  });
};
