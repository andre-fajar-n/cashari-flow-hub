import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { TablesInsert } from "@/integrations/supabase/types";
import { GoalTransferFilter, GoalTransferFormData } from "@/form-dto/goal-transfers";
import { GoalTransferWithRelations } from "@/models/goal-transfers";

// Re-export for backward compatibility
export type { GoalTransferWithRelations } from "@/models/goal-transfers";

export const useGoalTransfers = (params?: GoalTransferFilter) => {
  const { user } = useAuth();

  return useQuery<GoalTransferWithRelations[]>({
    queryKey: ["goal_transfers", user?.id, params],
    queryFn: async (): Promise<GoalTransferWithRelations[]> => {
      let query = supabase
        .from("goal_transfers")
        .select(`
          *,
          from_goal:goals!goal_transfers_from_goal_id_fkey(name),
          to_goal:goals!goal_transfers_to_goal_id_fkey(name),
          from_wallet:wallets!goal_transfers_from_wallet_id_fkey(name),
          to_wallet:wallets!goal_transfers_to_wallet_id_fkey(name),
          from_instrument:investment_instruments!goal_transfers_from_instrument_id_fkey(name),
          to_instrument:investment_instruments!goal_transfers_to_instrument_id_fkey(name),
          from_asset:investment_assets!goal_transfers_from_asset_id_fkey(name, symbol),
          to_asset:investment_assets!goal_transfers_to_asset_id_fkey(name, symbol)
        `)
        .eq("user_id", user?.id)
        .order("date", { ascending: false });

      if (params?.ids) {
        query = query.in("id", params.ids);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Failed to fetch goal transfers", error);
        throw error;
      }
      return (data || []) as unknown as GoalTransferWithRelations[];
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
        .insert({ ...transfer, user_id: user?.id, updated_at: null })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal_transfers"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal_funds_summary"] });
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
      queryClient.invalidateQueries({ queryKey: ["goal_movements"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["goal_investment_records"] });
      queryClient.invalidateQueries({ queryKey: ["goal_funds_summary"] });
      // Invalidate all money_movements variations
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "money_movements"
      });
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
          date: transfer.date,
          updated_at: new Date().toISOString(),
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
      queryClient.invalidateQueries({ queryKey: ["goal_funds_summary"] });
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
