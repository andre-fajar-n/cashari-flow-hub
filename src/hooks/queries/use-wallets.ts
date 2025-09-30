import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { WalletFormData } from "@/form-dto/wallets";
import { WalletModel } from "@/models/wallets";

export const useWallets = () => {
  const { user } = useAuth();

  return useQuery<WalletModel[]>({
    queryKey: ["wallets", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user?.id)
        .order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateWallet = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newWallet: WalletFormData) => {
      const { error } = await supabase
        .from("wallets")
        .insert({
          ...newWallet,
          user_id: user?.id,
          updated_at: null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast({
        title: "Berhasil",
        description: "Dompet berhasil ditambahkan",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal menambahkan dompet: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateWallet = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...wallet }: WalletFormData & { id: number }) => {
      const { error } = await supabase
        .from("wallets")
        .update({
          ...wallet,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user?.id)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast({
        title: "Berhasil",
        description: "Dompet berhasil diperbarui",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal memperbarui dompet: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteWallet = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("wallets")
        .delete()
        .eq("user_id", user?.id)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast({
        title: "Berhasil",
        description: "Dompet berhasil dihapus",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal menghapus dompet: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
