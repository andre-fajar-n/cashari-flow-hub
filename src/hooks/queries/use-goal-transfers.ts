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
    mutationFn: async ({ id, ...transfer }: Partial<GoalTransferFormData> & { id: number }) => {
      const { data, error } = await supabase
        .from("goal_transfers")
        .update({
          from_wallet_id: transfer.from_wallet_id,
          from_goal_id: transfer.from_goal_id,
          from_instrument_id: transfer.from_instrument_id,
          from_asset_id: transfer.from_asset_id,
          to_wallet_id: transfer.to_wallet_id,
          to_goal_id: transfer.to_goal_id,
          to_instrument_id: transfer.to_instrument_id,
          to_asset_id: transfer.to_asset_id,
          from_amount: transfer.from_amount,
          to_amount: transfer.to_amount,
          from_amount_unit: transfer.from_amount_unit || null,
          to_amount_unit: transfer.to_amount_unit || null,
          from_currency: transfer.from_currency,
          to_currency: transfer.to_currency,
          date: transfer.date,
        })
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
