import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { CategoryFormData } from "@/form-dto/categories";
import { CategoryApplication } from "@/constants/enums";
import { CategoryModel } from "@/models/categories";

export const useCategories = (isIncome?: boolean, application?: CategoryApplication) => {
  const { user } = useAuth();

  return useQuery<CategoryModel[]>({
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
        query = query.or("application.is.null,application.eq." + application);
      }
      
      const { data, error } = await query.order("name");
      
      if (error) {
        console.error("Failed to fetch categories", error);
        throw error;
      };
      return data;
    },
    enabled: !!user,
  });
};

export const useIncomeCategories = () => useCategories(true);
export const useExpenseCategories = () => useCategories(false);

export const useTransactionCategories = () => useCategories(undefined, 'transaction');
export const useInvestmentCategories = () => useCategories(undefined, 'investment');
export const useDebtCategories = () => useCategories(undefined, 'debt');

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

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newCategory: CategoryFormData) => {
      const payload = { ...newCategory, user_id: user?.id } as any;
      // Ensure null stored as null, not 'null' string
      if (payload.application === undefined) payload.application = null;
      payload.updated_at = null;
      const { error } = await supabase
        .from("categories")
        .insert(payload);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Berhasil",
        description: "Kategori berhasil ditambahkan",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal menambahkan kategori: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...category }: CategoryFormData & { id: number }) => {
      const payload = { ...category } as any;
      if (payload.application === undefined) payload.application = null;
      const { error } = await supabase
        .from("categories")
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Berhasil",
        description: "Kategori berhasil diperbarui",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal memperbarui kategori: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
