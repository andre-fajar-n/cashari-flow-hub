import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { fetchAllRows } from "@/integrations/supabase/batch-fetch";

export const useBusinessProjectTransactions = (projectId?: number) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["business-project-transactions", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      return fetchAllRows(
        supabase.from("business_project_transactions")
          .select(`
            *,
            transactions!inner(
              *,
              categories(name, is_income),
              wallets(name, currency_code)
            )
          `)
          .eq("project_id", projectId)
          .order("transaction_id", { ascending: true })
      );
    },
    enabled: !!user && !!projectId,
  });

  const addTransactionsToProject = useMutation({
    mutationFn: async ({ projectId, transactionIds }: { projectId: number; transactionIds: number[] }) => {
      const projectTransactions = transactionIds.map(transactionId => ({
        project_id: projectId,
        transaction_id: transactionId,
        user_id: user?.id,
      }));

      const { error } = await supabase
        .from("business_project_transactions")
        .insert(projectTransactions);

      if (error) {
        console.error("Failed to add transactions to business project", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-project-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["business_projects"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil ditambahkan ke proyek bisnis",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal menambahkan transaksi ke proyek bisnis",
        variant: "destructive",
      });
    },
  });

  const removeTransactionFromProject = useMutation({
    mutationFn: async ({ projectId, transactionId }: { projectId: number; transactionId: number }) => {
      const { error } = await supabase
        .from("business_project_transactions")
        .delete()
        .eq("project_id", projectId)
        .eq("transaction_id", transactionId);

      if (error) {
        console.error("Failed to remove transaction from business project", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-project-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["business_projects"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil dihapus dari proyek bisnis",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal menghapus transaksi dari proyek bisnis",
        variant: "destructive",
      });
    },
  });

  return {
    ...query,
    addTransactionsToProject,
    removeTransactionFromProject
  };
};
