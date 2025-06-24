import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import BudgetDialog from "@/components/budget/BudgetDialog";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useBudgets, useDeleteBudget } from "@/hooks/queries";
import ConfirmationModal from "@/components/ConfirmationModal";

interface Budget {
  id: number;
  name: string;
  amount: number;
  currency_code: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

const Budget = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>(undefined);
  const { mutate: deleteBudget } = useDeleteBudget();

  const { data: budgets, isLoading } = useBudgets();

  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (budgetId: number) => {
    setBudgetToDelete(budgetId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (budgetToDelete) {
      deleteBudget(budgetToDelete, {
        onSuccess: () => {
          toast({
            title: "Berhasil",
            description: "Transfer berhasil dihapus",
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
    }
  };

  const handleAddNew = () => {
    setSelectedBudget(undefined);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-4">Loading...</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          title="Hapus Transaksi"
          description="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Ya, Hapus"
          cancelText="Batal"
          variant="destructive"
        />
        <Card className="mb-6">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Manajemen Budget</CardTitle>
              <p className="text-gray-600">Kelola anggaran keuangan Anda</p>
            </div>
            {budgets && budgets.length > 0 && (
              <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Budget
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {budgets && budgets.length > 0 ? (
              <div className="grid gap-4">
                {budgets.map((budget) => (
                  <Card key={budget.id} className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <h3 className="font-semibold">{budget.name}</h3>
                        <p className="text-sm text-gray-600">
                          {budget.currency_code} {budget.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(budget)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteClick(budget.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada budget yang dibuat</p>
                <Button onClick={handleAddNew} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Budget Pertama
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <BudgetDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          budget={selectedBudget}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
          }}
        />
      </Layout>

    </ProtectedRoute>
  );
};

export default Budget;
