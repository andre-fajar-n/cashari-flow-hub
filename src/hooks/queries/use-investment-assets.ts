import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { AssetFormData } from "@/form-dto/investment-assets";

export const useInvestmentAssets = (instrumentId?: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["investment_assets", user?.id, instrumentId],
    queryFn: async () => {
      let query = supabase
        .from("investment_assets")
        .select(`*, investment_instruments(name)`)
        .eq("user_id", user?.id);

      if (instrumentId) {
        query = query.eq("instrument_id", instrumentId);
      }

      const { data, error } = await query.order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useDeleteInvestmentAsset = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (assetId: number) => {
      const { error } = await supabase
        .from("investment_assets")
        .delete()
        .eq("user_id", user?.id)
        .eq("id", assetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investment_assets"] });
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("investment_assets_paginated") });
      toast({
        title: "Berhasil",
        description: "Aset berhasil dihapus",
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

export const useCreateInvestmentAsset = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (asset: AssetFormData) => {
      const { error } = await supabase
        .from("investment_assets")
        .insert({ ...asset, user_id: user?.id, updated_at: null });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investment_assets"] });
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("investment_assets_paginated") });
      toast({
        title: "Berhasil",
        description: "Aset berhasil ditambahkan",
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

export const useUpdateInvestmentAsset = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...asset }: AssetFormData & { id: number }) => {
      const { error } = await supabase
        .from("investment_assets")
        .update({
          ...asset,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user?.id)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investment_assets"] });
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("investment_assets_paginated") });
      toast({
        title: "Berhasil",
        description: "Aset berhasil diperbarui",
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
