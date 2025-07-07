
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export const useCategories = (isIncome?: boolean, application?: 'transaction' | 'investment') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["categories", user?.id, isIncome],
    queryFn: async () => {
      let query = supabase
        .from("categories")
        .select("*")
        .eq("user_id", user?.id)
        .order("name");
      
      if (isIncome !== undefined) {
        query = query.eq("is_income", isIncome);
      }

      if (application) {
        query = query.eq("application", application);
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

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("user_id", user?.id)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Berhasil",
        description: "Kategori berhasil dihapus",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal menghapus kategori: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};