
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useBusinessProjects = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["business_projects", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_projects")
        .select("*")
        .eq("user_id", user?.id)
        .order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};
