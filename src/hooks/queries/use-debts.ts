import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { DebtFormData } from "@/form-dto/debts";
import { Database } from "@/integrations/supabase/types";

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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("debts")
        .delete()
        .eq("user_id", user?.id)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("debts_paginated") });
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

export const useUpdateDebt = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...debt }: DebtFormData & { id: number }) => {
      const { error } = await supabase
        .from("debts")
        .update(debt)
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("debts_paginated") });
      toast({
        title: "Berhasil",
        description: "Hutang/piutang berhasil diperbarui",
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

export const useCreateDebt = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (debt: DebtFormData) => {
      const { error } = await supabase
        .from("debts")
        .insert({
          ...debt,
          user_id: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("debts_paginated") });
      toast({
        title: "Berhasil",
        description: "Hutang/piutang berhasil ditambahkan",
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

const useDebtChangeStatus = (status: Database["public"]["Enums"]["debt_statuses"]) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (debtId: number) => {
      const { error } = await supabase
        .from("debts")
        .update({ status: status })
        .eq("id", debtId)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("debts_paginated") });
      toast({
        title: "Berhasil",
        description: "Hutang/piutang berhasil ditandai sebagai " + status,
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

export const useMarkDebtAsPaid = () => useDebtChangeStatus("paid_off");
export const useMarkDebtAsActive = () => useDebtChangeStatus("active");
