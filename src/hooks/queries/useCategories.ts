
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useCategories = (isIncome?: boolean) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["categories", user?.id, isIncome],
    queryFn: async () => {
      let query = supabase
        .from("categories")
        .select("*")
        .eq("user_id", user?.id);
      
      if (isIncome !== undefined) {
        query = query.eq("is_income", isIncome);
      }
      
      const { data, error } = await query.order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useIncomeCategories = () => useCategories(true);
export const useExpenseCategories = () => useCategories(false);
