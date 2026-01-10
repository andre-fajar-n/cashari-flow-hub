import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PendingPair {
  currency_code: string;
  base_currency_code: string;
}

export const usePendingExchangeRates = () => {
  const query = useQuery({
    queryKey: ['pending-exchange-rates'],
    queryFn: async (): Promise<PendingPair[]> => {
      // 1. Get all currency pairs
      const { data: currencyPairs, error: pairsError } = await supabase
        .from('currency_pairs')
        .select('currency_code, base_currency_code');

      if (pairsError) throw pairsError;
      if (!currencyPairs || currencyPairs.length === 0) return [];

      // 2. Get today's exchange rates
      const today = new Date().toISOString().split('T')[0];
      const { data: todayRates, error: ratesError } = await supabase
        .from('exchange_rates')
        .select('from_currency, to_currency')
        .eq('date', today);

      if (ratesError) throw ratesError;

      // 3. Find pairs without rates for today
      const pendingPairs = currencyPairs.filter(cp =>
        !todayRates?.some(er =>
          er.from_currency === cp.currency_code &&
          er.to_currency === cp.base_currency_code
        )
      );

      return pendingPairs;
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    ...query,
    pendingPairs: query.data || [],
    pendingCount: query.data?.length || 0,
    hasPendingRates: (query.data?.length || 0) > 0,
  };
};
