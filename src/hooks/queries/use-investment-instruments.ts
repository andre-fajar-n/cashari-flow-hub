import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InstrumentFormData } from "@/form-dto/investment-instruments";

export const useInvestmentInstruments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["investment_instruments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investment_instruments")
        .select("*")
        .eq("user_id", user?.id)
        .order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useDeleteInvestmentInstrument = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (instrumentId: number) => {
      const { error } = await supabase
        .from("investment_instruments")
        .delete()
        .eq("user_id", user?.id)
        .eq("id", instrumentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investment_instruments"] });
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("investment_instruments_paginated") });
      toast({
        title: "Berhasil",
        description: "Instrumen investasi berhasil dihapus",
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

export const useCreateInvestmentInstrument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (instrument: InstrumentFormData) => {
      const { error } = await supabase
        .from("investment_instruments")
        .insert({ ...instrument, user_id: user?.id, updated_at: null });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investment_instruments"] });
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("investment_instruments_paginated") });
      toast({
        title: "Berhasil",
        description: "Instrumen investasi berhasil ditambahkan",
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

export const useUpdateInvestmentInstrument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...instrument }: InstrumentFormData & { id: number }) => {
      const { error } = await supabase
        .from("investment_instruments")
        .update({
          ...instrument,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user?.id)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investment_instruments"] });
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("investment_instruments_paginated") });
      toast({
        title: "Berhasil",
        description: "Instrumen investasi berhasil diperbarui",
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
