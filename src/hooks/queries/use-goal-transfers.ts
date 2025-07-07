
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { GoalTransferFormData } from "@/form-dto/goal-transfers";

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
          from_goal:goals!goal_transfers_from_goal_id_fkey(name),
          to_wallet:wallets!goal_transfers_to_wallet_id_fkey(name),
          to_goal:goals!goal_transfers_to_goal_id_fkey(name),
          from_instrument:investment_instruments!goal_transfers_from_instrument_id_fkey(name),
          to_instrument:investment_instruments!goal_transfers_to_instrument_id_fkey(name),
          from_asset:investment_assets!goal_transfers_from_asset_id_fkey(name, symbol),
          to_asset:investment_assets!goal_transfers_to_asset_id_fkey(name, symbol)
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
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (transfer: GoalTransferFormData) => {
      const { error } = await supabase
        .from("goal_transfers")
        .insert({ ...transfer, user_id: user?.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal_transfers"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["investment_instruments"] });
      queryClient.invalidateQueries({ queryKey: ["investment_assets"] });
      toast({
        title: "Berhasil",
        description: "Transfer berhasil ditambahkan",
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

export const useUpdateGoalTransfer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...transfer }: GoalTransferFormData & { id: number }) => {
      const { error } = await supabase
        .from("goal_transfers")
        .update(transfer)
        .eq("user_id", user?.id)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal_transfers"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["investment_instruments"] });
      queryClient.invalidateQueries({ queryKey: ["investment_assets"] });
      toast({
        title: "Berhasil",
        description: "Transfer berhasil diperbarui",
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

export const useDeleteGoalTransfer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("goal_transfers")
        .delete()
        .eq("user_id", user?.id)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal_transfers"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["investment_instruments"] });
      queryClient.invalidateQueries({ queryKey: ["investment_assets"] });
      toast({
        title: "Berhasil",
        description: "Transfer berhasil dihapus",
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
