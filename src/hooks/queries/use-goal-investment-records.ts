import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export const useGoalInvestmentRecords = (goalId?: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["goal_investment_records", user?.id, goalId],
    queryFn: async () => {
      let query = supabase
        .from("goal_investment_records")
        .select(`
          *,
          goal:goals(name),
          wallet:wallets(name),
          category:categories(name, is_income),
          instrument:investment_instruments(name),
          asset:investment_assets(name, symbol)
        `)
        .eq("user_id", user?.id);
      
      if (goalId) {
        query = query.eq("goal_id", goalId);
      }
      
      const { data, error } = await query.order("date", { ascending: false });
      
      if (error) throw error;
      return data;
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
        .insert({ ...record, user_id: user?.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal_investment_records"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
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
        .update(record)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal_investment_records"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
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
