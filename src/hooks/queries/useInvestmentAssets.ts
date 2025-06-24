
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useInvestmentAssets = (instrumentId?: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["investment_assets", user?.id, instrumentId],
    queryFn: async () => {
      let query = supabase
        .from("investment_assets_with_instruments")
        .select(`*`)
        .eq("user_id", user?.id);
      
      if (instrumentId) {
        query = query.eq("instrument_id", instrumentId);
      }
      
      const { data, error } = await query.order("instrument_name").order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useDeleteInvestmentAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("investment_assets")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investment_assets"] });
    },
  });
};
