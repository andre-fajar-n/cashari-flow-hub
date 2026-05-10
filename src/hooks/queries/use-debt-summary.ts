import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DebtSummaryModel } from "@/models/debt-summary";
import { fetchAllRows } from "@/integrations/supabase/batch-fetch";

export const useDebtSummary = () => {
  const { user } = useAuth();

  return useQuery<DebtSummaryModel[]>({
    queryKey: ["debt_summary", user?.id],
    queryFn: async () => {
      return fetchAllRows<DebtSummaryModel>(
        supabase.from("debt_summary").select('*')
          .eq("user_id", user?.id)
          .order("debt_id", { ascending: true }) as any
      );
    },
    enabled: !!user,
  });
};

export const useDebtSummaryById = (debtId: number) => {
  const { user } = useAuth();

  return useQuery<DebtSummaryModel[]>({
    queryKey: ["debt_summary", user?.id, debtId],
    queryFn: async () => {
      return fetchAllRows<DebtSummaryModel>(
        supabase.from("debt_summary").select('*')
          .eq("user_id", user?.id)
          .eq("debt_id", debtId)
          .order("debt_id", { ascending: true }) as any
      );
    },
    enabled: !!user && !!debtId,
  });
};
