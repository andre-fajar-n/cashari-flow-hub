import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFetchExchangeRates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params?: { date?: string, fromCurrency?: string, toCurrency?: string }) => {
      const { data, error } = await supabase.functions.invoke('fetch-exchange-rate-by-date', {
        body: params ? {
          date: params.date,
          from_currency: params.fromCurrency,
          to_currency: params.toCurrency
        } : undefined,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['pending-exchange-rates'] });
      queryClient.invalidateQueries({ queryKey: ['exchange-rates'] });
      queryClient.invalidateQueries({ queryKey: ['money-summary'] });
      toast.success('Exchange rates sedang di update, silahkan cek kembali beberapa saat lagi.');
    },
    onError: (error: Error) => {
      console.error('Failed to fetch exchange rates:', error);
      toast.error(`Gagal update exchange rates: ${error.message}`);
    },
  });
};
