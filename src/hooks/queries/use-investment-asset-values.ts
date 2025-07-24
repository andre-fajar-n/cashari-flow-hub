
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { AssetValueFormData } from "@/form-dto/investment-asset-values";
import { InvestmentAssetValueModel } from "@/models/investment-asset-values";

export const useInvestmentAssetValues = (assetId?: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["investment_asset_values", user?.id, assetId],
    queryFn: async () => {
      let query = supabase
        .from("investment_asset_values")
        .select("*, investment_assets!inner(name, symbol, currency_code)")
        .eq("user_id", user?.id);

      if (assetId) {
        query = query.eq("asset_id", assetId);
      }

      const { data, error } = await query.order("date", { ascending: false });

      if (error) throw error;
      return data as InvestmentAssetValueModel[];
    },
    enabled: !!user,
  });
};

export const useDeleteInvestmentAssetValue = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (valueId: number) => {
      const { error } = await supabase
        .from("investment_asset_values")
        .delete()
        .eq("user_id", user?.id)
        .eq("id", valueId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investment_asset_values"] });
      toast({
        title: "Berhasil",
        description: "Nilai aset berhasil dihapus",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCreateInvestmentAssetValue = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (assetValue: AssetValueFormData) => {
      const { error } = await supabase
        .from("investment_asset_values")
        .insert({ ...assetValue, user_id: user?.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investment_asset_values"] });
      toast({
        title: "Berhasil",
        description: "Nilai aset berhasil ditambahkan",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateInvestmentAssetValue = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...assetValue }: AssetValueFormData & { id: number }) => {
      const { error } = await supabase
        .from("investment_asset_values")
        .update(assetValue)
        .eq("user_id", user?.id)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investment_asset_values"] });
      toast({
        title: "Berhasil",
        description: "Nilai aset berhasil diperbarui",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
