import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { DebtHistoryFilter, DebtHistoryFormData } from "@/form-dto/debt-histories";
import { DebtHistoryModel } from "@/models/debt-histories";

export const useDebtHistories = (params: DebtHistoryFilter = {}) => {
  const { user } = useAuth();
  const { debtId, ids } = params;

  return useQuery<DebtHistoryModel[]>({
    queryKey: ["debt-histories", user?.id, debtId, ids],
    queryFn: async () => {
      let query = supabase
        .from("debt_histories")
        .select(`
          *,
          wallets (id, name, currency_code, initial_amount),
          categories (id, name, is_income, application, parent_id),
          debts (id, name, type, currency_code, due_date)
        `)
        .eq("user_id", user?.id)
        .order("date", { ascending: false });

      if (debtId) {
        query = query.eq("debt_id", debtId);
      }

      if (ids) {
        query = query.in("id", ids);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching debt histories:", error);
        throw error;
      }
      return data;
    },
    enabled: !!user && (!debtId || !!debtId) && (!ids || !!ids),
  });
};

export const useCreateDebtHistory = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (debtHistory: DebtHistoryFormData) => {
      const { error } = await supabase
        .from("debt_histories")
        .insert({
          ...debtHistory as any,
          user_id: user?.id,
          updated_at: null,
        });

      if (error) {
        console.error("Error creating debt history:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debt-histories"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
      queryClient.invalidateQueries({ queryKey: ["debt-summary"] });
      toast({
        title: "Berhasil",
        description: "History hutang/piutang berhasil ditambahkan",
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

export const useDeleteDebtHistory = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("debt_histories")
        .delete()
        .eq("user_id", user?.id)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debt-histories"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
      queryClient.invalidateQueries({ queryKey: ["debt-summary"] });
      toast({
        title: "Berhasil",
        description: "History hutang/piutang berhasil dihapus",
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

export const useUpdateDebtHistory = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...debtHistory }: DebtHistoryFormData & { id: number }) => {
      const { error } = await supabase
        .from("debt_histories")
        .update({
          ...(debtHistory as any),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user?.id)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debt-histories"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
      queryClient.invalidateQueries({ queryKey: ["debt-summary"] });
      toast({
        title: "Berhasil",
        description: "History hutang/piutang berhasil diperbarui",
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
