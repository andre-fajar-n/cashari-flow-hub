import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ExchangeRateModel {
  from_currency: string;
  to_currency: string;
  rate: number;
  date: string;
}

export const useExchangeRate = (fromCurrency: string, toCurrency: string) => {
  return useQuery<ExchangeRateModel | null>({
    queryKey: ["exchange_rate", fromCurrency, toCurrency],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exchange_rates")
        .select("*")
        .eq("from_currency", fromCurrency)
        .eq("to_currency", toCurrency)
        .order("date", { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No data found
          return null;
        }
        console.error("Failed to fetch exchange rate", error);
        throw error;
      }
      
      return data;
    },
  });
};

export const useGoldPrice = (baseCurrency: string) => {
  return useExchangeRate("XAU", baseCurrency);
};
