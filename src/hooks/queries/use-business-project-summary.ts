import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { BusinessProjectSummaryModel } from "@/models/business-projects";

export const useBusinessProjectSummary = (projectId?: number) => {
  const { user } = useAuth();

  return useQuery<BusinessProjectSummaryModel[]>({
    queryKey: ["business-project-summary", user?.id, projectId],
    queryFn: async () => {
      let query = supabase
        .from("business_project_summary")
        .select(`*`)
        .eq("user_id", user?.id);

      if (projectId) {
        query = query.eq("id", projectId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Failed to fetch business project summary", error);
        throw error;
      }
      return data;
    },
    enabled: !!user,
  });
};

export const useBusinessProjectsSummaryAll = () => {
  const { user } = useAuth();

  return useQuery<BusinessProjectSummaryModel[]>({
    queryKey: ["business-projects-summary-all", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_project_summary")
        .select(`*`)
        .eq("user_id", user?.id);

      if (error) {
        console.error("Failed to fetch business projects summary", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user,
  });
};
