
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useInvestmentInstruments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["investment_instruments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investment_instruments")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};
