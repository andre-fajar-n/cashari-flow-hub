import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CurrencyModel } from "@/models/currencies";
import { CurrencyFilter } from "@/form-dto/currencies";

export const useCurrencies = (filter?: CurrencyFilter) => {
  return useQuery<CurrencyModel[]>({
    queryKey: ["currencies", filter],
    queryFn: async () => {
      let query = supabase
        .from("currencies")
        .select("*")
        .order("code");

      if (filter?.codes) {
        query = query.in("code", filter.codes);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Failed to fetch currencies", error);
        throw error;
      };

      return data;
    },
  });
};

export const useCurrencyDetail = (code: string) => {
  return useQuery<CurrencyModel>({
    queryKey: ["currency", code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("*")
        .eq("code", code)
        .single();

      if (error) {
        console.error("Failed to fetch currency", error);
        throw error;
      };

      return data;
    },
    enabled: !!code,
  });
};
