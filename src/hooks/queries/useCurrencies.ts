
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { CurrencyFormData } from "@/form-dto/currencies";

export const useCurrencies = (is_default?: boolean) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["currencies", user?.id],
    queryFn: async () => {
      let query = supabase
        .from("currencies")
        .select("code, name, symbol, is_default")
        .eq("user_id", user?.id)
        .order("is_default", { ascending: false })
        .order("code");

      if (is_default !== undefined) {
        query = query.eq("is_default", is_default);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useDefaultCurrency = () => {
  const { data: defaultCurrency } = useCurrencies(true);
  
  return defaultCurrency && defaultCurrency.length > 0 ? defaultCurrency[0] : null;
};

export const useCreateCurrency = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newCurrency: CurrencyFormData) => {
      const { error } = await supabase
        .from("currencies")
        .insert({
          ...newCurrency,
          user_id: user?.id,
          is_default: false,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast({
        title: "Berhasil",
        description: "Mata uang berhasil ditambahkan",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal menambahkan mata uang: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCurrency = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (currency: CurrencyFormData & { originalCode: string }) => {
      const { error } = await supabase
        .from("currencies")
        .update({
          code: currency.code,
          name: currency.name,
          symbol: currency.symbol,
        })
        .eq("code", currency.originalCode)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast({
        title: "Berhasil",
        description: "Mata uang berhasil diperbarui",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal memperbarui mata uang: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteCurrency = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (code: string) => {
      const { error } = await supabase
        .from("currencies")
        .delete()
        .eq("code", code)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast({
        title: "Berhasil",
        description: "Mata uang berhasil dihapus",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal menghapus mata uang: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useSetDefaultCurrency = () =>{ 
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (currencyCode: string) => {
      // First, unset all default currencies for this user
      await supabase
        .from("currencies")
        .update({ is_default: false })
        .eq("user_id", user?.id);

      // Then set the selected currency as default
      const { error } = await supabase
        .from("currencies")
        .update({ is_default: true })
        .eq("code", currencyCode)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast({
        title: "Berhasil",
        description: "Mata uang default berhasil diubah",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal mengubah mata uang default: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
