
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export interface DebtHistoryFormData {
  debt_id: number;
  wallet_id: number;
  category_id: number;
  amount: number;
  currency_code: string;
  date: string;
  description?: string;
  exchange_rate?: number;
}

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
          categories (name)
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
          ...debtHistory,
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

export const useMarkDebtAsPaid = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (debtId: number) => {
      const { error } = await supabase
        .from("debts")
        .update({ status: "paid_off" })
        .eq("id", debtId)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      toast({
        title: "Berhasil",
        description: "Hutang/piutang berhasil ditandai sebagai lunas",
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
