
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { TransactionFormData } from "@/form-dto/transactions";

export const useTransactions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          categories(name, is_income),
          wallets(name)
        `)
        .eq("user_id", user?.id)
        .order("date", { ascending: false });
      
      if (error) {
        console.error("Failed to fetch transactions", error);
        throw error
      };
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (transaction: TransactionFormData) => {
      const { data, error } = await supabase
        .from("transactions")
        .insert({ ...transaction, user_id: user?.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil ditambahkan",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal menyimpan transaksi",
        description: "Terjadi kesalahan saat menyimpan data. Error: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...transaction }: TransactionFormData & { id: number }) => {
      const { data, error } = await supabase
        .from("transactions")
        .update(transaction)
        .eq("user_id", user?.id)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil diperbarui",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal menyimpan transaksi",
        description: "Terjadi kesalahan saat menyimpan data. Error: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("user_id", user?.id)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil dihapus",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Gagal menghapus transaksi: " + error.message,
        variant: "destructive",
      });
    },
  });
};
