import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { TablesInsert } from "@/integrations/supabase/types";
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
          from_goal:from_goal_id(name),
          to_goal:to_goal_id(name),
          from_wallet:from_wallet_id(name),
          to_wallet:to_wallet_id(name),
          from_instrument:from_instrument_id(name),
          to_instrument:to_instrument_id(name),
          from_asset:from_asset_id(name, symbol),
          to_asset:to_asset_id(name, symbol)
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

export const useDeleteGoalTransfer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
    }
  });
};

export const useUpdateGoalTransfer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...transfer }: GoalTransferFormData & { id: number }) => {
      const { data, error } = await supabase
        .from("goal_transfers")
        .update(transfer)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal_transfers"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
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
