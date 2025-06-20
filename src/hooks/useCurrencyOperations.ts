
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface CurrencyFormData {
  code: string;
  name: string;
  symbol: string;
}

export const useCurrencyOperations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (newCurrency: CurrencyFormData) => {
      const { error } = await supabase
        .from("currencies")
        .insert({
          ...newCurrency,
          user_id: user?.id,
          is_default: false,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast({
        title: "Berhasil",
        description: "Mata uang berhasil ditambahkan",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal menambahkan mata uang: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (currency: CurrencyFormData & { originalCode: string }) => {
      const { error } = await supabase
        .from("currencies")
        .update({
          code: currency.code,
          name: currency.name,
          symbol: currency.symbol,
        })
        .eq("code", currency.originalCode)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast({
        title: "Berhasil",
        description: "Mata uang berhasil diperbarui",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal memperbarui mata uang: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (currencyCode: string) => {
      // First, unset all default currencies for this user
      await supabase
        .from("currencies")
        .update({ is_default: false })
        .eq("user_id", user?.id);

      // Then set the selected currency as default
      const { error } = await supabase
        .from("currencies")
        .update({ is_default: true })
        .eq("code", currencyCode)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast({
        title: "Berhasil",
        description: "Mata uang default berhasil diubah",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal mengubah mata uang default: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const checkCurrencyUsage = async (currencyCode: string) => {
    // Check if currency is used in transactions
    const { data: transactions } = await supabase
      .from("transactions")
      .select("id")
      .eq("currency_code", currencyCode)
      .eq("user_id", user?.id)
      .limit(1);

    // Check if currency is used in wallets
    const { data: wallets } = await supabase
      .from("wallets")
      .select("id")
      .eq("currency_code", currencyCode)
      .eq("user_id", user?.id)
      .limit(1);

    return (transactions && transactions.length > 0) || (wallets && wallets.length > 0);
  };

  const deleteMutation = useMutation({
    mutationFn: async (code: string) => {
      // Check if currency is being used
      const isUsed = await checkCurrencyUsage(code);
      if (isUsed) {
        throw new Error("Mata uang ini sedang digunakan di transaksi atau dompet. Hapus terlebih dahulu transaksi dan dompet yang menggunakan mata uang ini.");
      }

      const { error } = await supabase
        .from("currencies")
        .delete()
        .eq("code", code)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast({
        title: "Berhasil",
        description: "Mata uang berhasil dihapus",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createMutation,
    updateMutation,
    setDefaultMutation,
    deleteMutation,
  };
};
