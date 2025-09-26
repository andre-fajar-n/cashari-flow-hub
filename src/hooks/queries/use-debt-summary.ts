import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const useDebtSummary = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["debt_summary", user?.id],
    queryFn: async () => {
      let query = supabase
        .from("debt_summary")
        .select('*')
        .eq("user_id", user?.id);

      const { data, error } = await query;
      if (error) {
        console.error("Failed to fetch debt summary", error);
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });
};

export const useDebtSummaryById = (debtId: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["debt_summary", user?.id, debtId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("debt_summary")
        .select('*')
        .eq("user_id", user?.id)
        .eq("debt_id", debtId)

      if (error) {
        console.error("Failed to fetch debt summary by id", error);
        throw error;
      }

      return data;
    },
    enabled: !!user && !!debtId,
  });
};
