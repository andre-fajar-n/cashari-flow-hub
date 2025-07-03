import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
