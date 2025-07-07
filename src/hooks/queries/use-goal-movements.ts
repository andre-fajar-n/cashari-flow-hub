
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const useGoalMovements = (goalId?: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["goal_movements", user?.id, goalId],
    queryFn: async () => {
      let query = supabase
        .from("goal_movements")
        .select("*")
        .eq("user_id", user?.id);
      
      if (goalId) {
        query = query.eq("goal_id", goalId);
      }
      
      const { data, error } = await query.order("date", { ascending: false }).order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};
