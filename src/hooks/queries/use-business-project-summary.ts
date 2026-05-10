import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { BusinessProjectSummaryModel } from "@/models/business-projects";
import { fetchAllRows } from "@/integrations/supabase/batch-fetch";

export const useBusinessProjectSummary = (projectId?: number) => {
  const { user } = useAuth();

  return useQuery<BusinessProjectSummaryModel[]>({
    queryKey: ["business-project-summary", user?.id, projectId],
    queryFn: async () => {
      let query = supabase
        .from("business_project_summary")
        .select(`*`)
        .eq("user_id", user?.id)
        .order("id", { ascending: true });

      if (projectId) {
        query = query.eq("id", projectId);
      }

      return fetchAllRows<BusinessProjectSummaryModel>(query as any);
    },
    enabled: !!user,
  });
};

export const useBusinessProjectsSummaryAll = () => {
  const { user } = useAuth();

  return useQuery<BusinessProjectSummaryModel[]>({
    queryKey: ["business-projects-summary-all", user?.id],
    queryFn: async () => {
      return fetchAllRows<BusinessProjectSummaryModel>(
        supabase.from("business_project_summary").select(`*`)
          .eq("user_id", user?.id)
          .order("id", { ascending: true }) as any
      );
    },
    enabled: !!user,
  });
};
