
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useCurrencies = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["currencies", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("code, name, symbol, is_default")
        .eq("user_id", user?.id)
        .order("is_default", { ascending: false })
        .order("code");
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useDefaultCurrency = () => {
  const { data: currencies } = useCurrencies();
  
  return currencies?.find(currency => currency.is_default) || currencies?.[0];
};
