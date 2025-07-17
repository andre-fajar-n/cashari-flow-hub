import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { DebtHistoryFormData } from "@/form-dto/debt-histories";

export const useDebtHistories = (debtId?: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["debt-histories", user?.id, debtId],
    queryFn: async () => {
      let query = supabase
        .from("debt_histories")
        .select(`
          *,
          wallets (name),
          categories (name, is_income)
        `)
        .eq("user_id", user?.id)
        .order("date", { ascending: false });

      if (debtId) {
        query = query.eq("debt_id", debtId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
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
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debt-histories"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
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
        .update(debtHistory as any)
        .eq("user_id", user?.id)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debt-histories"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
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
