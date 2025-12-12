import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { UserSettingsFormData } from "@/form-dto/user-settings";
import { UserSettingsModel } from "@/models/user-settings";

export const useUserSettings = () => {
  const { user } = useAuth();

  return useQuery<UserSettingsModel | null>({
    queryKey: ["user_settings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*, currencies(symbol)")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw error;
      }

      return data || null;
    },
    enabled: !!user,
  });
};

export const useCreateUserSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UserSettingsFormData) => {
      const { error } = await supabase
        .from("user_settings")
        .insert({
          user_id: user?.id!,
          base_currency_code: data.base_currency_code,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_settings"] });
      toast({
        title: "Berhasil",
        description: "Pengaturan berhasil disimpan",
      });
    },
    onError: (error) => {
      console.error("Failed to create user settings:", error);
      toast({
        title: "Gagal",
        description: "Gagal menyimpan pengaturan",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UserSettingsFormData) => {
      const { error } = await supabase
        .from("user_settings")
        .update({
          base_currency_code: data.base_currency_code,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_settings"] });
      toast({
        title: "Berhasil",
        description: "Pengaturan berhasil diperbarui",
      });
    },
    onError: (error) => {
      console.error("Failed to update user settings:", error);
      toast({
        title: "Gagal",
        description: "Gagal memperbarui pengaturan",
        variant: "destructive",
      });
    },
  });
};
