import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import BudgetDialog from "@/components/budget/BudgetDialog";
import Layout from "@/components/Layout";
import { useBudgets, useDeleteBudget } from "@/hooks/queries/useBudgets";
import ConfirmationModal from "@/components/ConfirmationModal";
import { BudgetModel } from "@/models/budgets";

const Budget = () => {
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetModel | undefined>(undefined);
  const { mutate: deleteBudget } = useDeleteBudget();
  const { data: budgets, isLoading } = useBudgets();

  const handleEdit = (budget: BudgetModel) => {
    setSelectedBudget(budget);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (budgetId: number) => {
    setBudgetToDelete(budgetId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (budgetToDelete) {
      deleteBudget(budgetToDelete);
    }
  };

  const handleAddNew = () => {
    setSelectedBudget(undefined);
    setIsDialogOpen(true);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          title="Hapus Budget"
          description="Apakah Anda yakin ingin menghapus budget ini? Tindakan ini tidak dapat dibatalkan."
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
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Memuat budget...</p>
              </div>
            ) : budgets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada budget yang dibuat</p>
                <Button onClick={handleAddNew} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Budget Pertama
                </Button>
              </div>
            ) : (
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
