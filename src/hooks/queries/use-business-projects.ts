import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { BusinessProjectFormData } from "@/form-dto/business-projects";
import { BusinessProjectModel } from "@/models/business-projects";

export const useBusinessProjects = () => {
  const { user } = useAuth();

  return useQuery<BusinessProjectModel[]>({
    queryKey: ["business_projects", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_projects")
        .select("*")
        .eq("user_id", user?.id)
        .order("name");
      
      if (error) {
        console.error("Failed to fetch business projects", error);
        throw error;
      };
      return data;
    },
    enabled: !!user,
  });
};

export const useDeleteBusinessProject = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("business_projects")
        .delete()
        .eq("user_id", user?.id)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business_projects"] });
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("business_projects_paginated") });
      toast({
        title: "Berhasil",
        description: "Proyek berhasil dihapus",
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

export const useCreateBusinessProject = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newProject: BusinessProjectFormData) => {
      const { error } = await supabase
        .from("business_projects")
        .insert({
          ...newProject,
          user_id: user.id,
          updated_at: null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business_projects"] });
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("business_projects_paginated") });
      toast({
        title: "Berhasil",
        description: "Proyek berhasil ditambahkan",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal menambahkan proyek: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateBusinessProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...project }: BusinessProjectFormData & { id: number }) => {
      const { error } = await supabase
        .from("business_projects")
        .update({
          ...project,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user?.id)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business_projects"] });
      queryClient.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0] ?? "").includes("business_projects_paginated") });
      toast({
        title: "Berhasil",
        description: "Proyek berhasil diperbarui",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal memperbarui proyek: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useBusinessProjectDetail = (id: number) => {
  const { user } = useAuth();

  return useQuery<BusinessProjectModel>({
    queryKey: ["business_projects", user?.id, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_projects")
        .select("*")
        .eq("user_id", user?.id)
        .eq("id", id)
        .single();
      
      if (error) {
        console.error("Failed to fetch business project detail", error);
        throw error;
      };
      return data;
    },
    enabled: !!user && !!id,
  });
};