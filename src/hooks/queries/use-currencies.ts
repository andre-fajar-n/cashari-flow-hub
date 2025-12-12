import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CurrencyModel } from "@/models/currencies";
import { CurrencyFilter } from "@/form-dto/currencies";

export const useCurrencies = (filter?: CurrencyFilter) => {
  const { user } = useAuth();

  return useQuery<CurrencyModel[]>({
    queryKey: ["currencies", user?.id, filter],
    queryFn: async () => {
      let query = supabase
        .from("currencies")
        .select("*")
        .eq("user_id", user?.id)
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
    enabled: !!user,
  });
};

export const useCurrencyDetail = (code: string) => {
  const { user } = useAuth();

  return useQuery<CurrencyModel>({
    queryKey: ["currency", user?.id, code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("*")
        .eq("user_id", user?.id)
        .eq("code", code)
        .single();

      if (error) {
        console.error("Failed to fetch currency", error);
        throw error;
      };

      return data;
    },
    enabled: !!user && !!code,
  });
};
