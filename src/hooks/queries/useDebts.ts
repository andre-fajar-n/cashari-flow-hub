
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

export interface DebtModel {
  id: number;
  name: string;
  type: Database["public"]["Enums"]["debt_type"];
  currency_code: string;
  due_date: string;
  created_at: string;
}

export const useDebts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["debts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("debts")
        .select("*")
        .eq("user_id", user?.id)
        .order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useDeleteDebt = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (debt: DebtModel) => {
      const { error } = await supabase
        .from("debts")
        .delete()
        .eq("user_id", user?.id)
        .eq("id", debt.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      toast({
        title: "Berhasil",
        description: "Hutang/piutang berhasil dihapus",
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
