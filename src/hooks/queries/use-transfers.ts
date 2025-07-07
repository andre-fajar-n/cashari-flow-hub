import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
      toast({
        title: "Berhasil",
        description: "Transfer berhasil ditambahkan",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Gagal menyimpan transfer",
        description: "Terjadi kesalahan saat menyimpan data.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTransfer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      toast({
        title: "Berhasil",
        description: "Transfer berhasil diperbarui",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Gagal menyimpan transfer",
        description: "Terjadi kesalahan saat menyimpan data.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTransfer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (transferId: number) => {
      const { error } = await supabase
        .from("transfers")
        .delete()
        .eq("id", transferId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Transfer berhasil dihapus",
      });
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
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
