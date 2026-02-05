import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFetchExchangeRates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-exchange-rate-by-date');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['pending-exchange-rates'] });
      queryClient.invalidateQueries({ queryKey: ['exchange-rates'] });
      queryClient.invalidateQueries({ queryKey: ['money-summary'] });
      toast.success('Exchange rates berhasil diupdate');
    },
    onError: (error: Error) => {
      console.error('Failed to fetch exchange rates:', error);
      toast.error(`Gagal update exchange rates: ${error.message}`);
    },
  });
};
