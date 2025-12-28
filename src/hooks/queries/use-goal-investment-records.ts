import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { GoalInvestmentRecordFilter } from "@/form-dto/goal-investment-records";
import { GoalInvestmentRecordWithRelations } from "@/models/goal-investment-records";

export const useGoalInvestmentRecords = (params?: GoalInvestmentRecordFilter) => {
  const { user } = useAuth();

  return useQuery<GoalInvestmentRecordWithRelations[]>({
    queryKey: ["goal_investment_records", user?.id, params],
    queryFn: async (): Promise<GoalInvestmentRecordWithRelations[]> => {
      let query = supabase
        .from("goal_investment_records")
        .select(`
          *,
          goal:goals(name),
          wallet:wallets(name, currency_code),
          category:categories(name, is_income),
          instrument:investment_instruments(name),
          asset:investment_assets(name, symbol)
        `)
        .eq("user_id", user?.id);

      if (params?.goalId) {
        query = query.eq("goal_id", params.goalId);
      }

      if (params?.assetId) {
        query = query.eq("asset_id", params.assetId);
      }

      if (params?.ids) {
        query = query.in("id", params.ids);
      }

      const { data, error } = await query.order("date", { ascending: false });
      if (error) {
        console.error("Failed to fetch goal investment records", error);
        throw error;
      }
      return (data || []) as GoalInvestmentRecordWithRelations[];
    },
    enabled: !!user,
  });
};

export const useCreateGoalInvestmentRecord = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (record: Omit<TablesInsert<"goal_investment_records">, "user_id">) => {
      const { data, error } = await supabase
        .from("goal_investment_records")
        .insert({ ...record, user_id: user?.id, updated_at: null })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal_investment_records"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal_funds_summary"] });
      queryClient.invalidateQueries({ queryKey: ["investment_assets"] });
      queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
      toast({
        title: "Berhasil",
        description: "Investment record berhasil ditambahkan",
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

export const useUpdateGoalInvestmentRecord = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...record }: TablesUpdate<"goal_investment_records"> & { id: number }) => {
      const { data, error } = await supabase
        .from("goal_investment_records")
        .update({
          ...record,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal_investment_records"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal_funds_summary"] });
      queryClient.invalidateQueries({ queryKey: ["investment_assets"] });
      queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
      toast({
        title: "Berhasil",
        description: "Investment record berhasil diperbarui",
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

export const useDeleteGoalInvestmentRecord = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("goal_investment_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal_investment_records"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["investment_assets"] });
      queryClient.invalidateQueries({ queryKey: ["goal_funds_summary"] });
      // Invalidate all money_movements variations
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "money_movements"
      });
      toast({
        title: "Berhasil",
        description: "Record berhasil dihapus",
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
