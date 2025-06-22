
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export const useTransfers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transfers", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transfers")
        .select(`
          *,
          from_wallet:wallets!transfers_from_wallet_id_fkey(name),
          to_wallet:wallets!transfers_to_wallet_id_fkey(name),
          from_currency:currencies!transfers_currency_from_fkey(symbol),
          to_currency:currencies!transfers_currency_to_fkey(symbol)
        `)
        .eq("user_id", user?.id)
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (transfer: Omit<TablesInsert<"transfers">, "user_id">) => {
      const { data, error } = await supabase
        .from("transfers")
        .insert({ ...transfer, user_id: user?.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
};

export const useUpdateTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...transfer }: TablesUpdate<"transfers"> & { id: number }) => {
      const { data, error } = await supabase
        .from("transfers")
        .update(transfer)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
};

export const useDeleteTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("transfers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
};
