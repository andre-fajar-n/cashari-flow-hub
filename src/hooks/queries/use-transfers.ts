import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { TransferFilter } from "@/form-dto/transfer";
import { TransferModel } from "@/models/transfer";

export const useTransfers = (params?: TransferFilter) => {
  const { user } = useAuth();

  return useQuery<TransferModel[]>({
    queryKey: ["transfers", user?.id, params],
    queryFn: async (): Promise<TransferModel[]> => {
      let query = supabase
        .from("transfers")
        .select(`
          *,
          from_wallet:wallets!transfers_from_wallet_id_fkey(id, name, currency_code, initial_amount),
          to_wallet:wallets!transfers_to_wallet_id_fkey(id, name, currency_code, initial_amount)
        `)
        .eq("user_id", user?.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (params?.ids) {
        query = query.in("id", params.ids);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Failed to fetch transfers", error);
        throw error;
      }
      return (data || []) as unknown as TransferModel[];
    },
    enabled: !!user && (!params?.ids || !!params?.ids),
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
        .insert({ ...transfer, user_id: user?.id, updated_at: null })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("transfers_paginated") });
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
        .update({
          ...transfer,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("transfers_paginated") });
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
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("transfers_paginated") });
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
