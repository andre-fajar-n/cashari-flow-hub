
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export const useGoalTransfers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["goal_transfers", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goal_transfers")
        .select(`
          *,
          from_wallet:wallets!goal_transfers_from_wallet_id_fkey(name),
          to_goal:goals!goal_transfers_to_goal_id_fkey(name)
        `)
        .eq("user_id", user?.id)
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateGoalTransfer = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (transfer: Omit<TablesInsert<"goal_transfers">, "user_id">) => {
      const { data, error } = await supabase
        .from("goal_transfers")
        .insert({ ...transfer, user_id: user?.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal_transfers"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
};

export const useDeleteGoalTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("goal_transfers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal_transfers"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
};
