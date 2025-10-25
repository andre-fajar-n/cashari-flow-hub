import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CurrencyModel } from "@/models/currencies";

export const useCurrencies = () => {
  const { user } = useAuth();

  return useQuery<CurrencyModel[]>({
    queryKey: ["currencies", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("*")
        .eq("user_id", user?.id)
        .order("code");

      if (error) {
        console.error("Failed to fetch currencies", error);
        throw error;
      };

      return data;
    },
    enabled: !!user,
  });
};
