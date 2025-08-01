import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import BudgetDialog from "@/components/budget/BudgetDialog";
import Layout from "@/components/Layout";
import { useBudgets, useDeleteBudget } from "@/hooks/queries/use-budgets";
import { useCurrencies } from "@/hooks/queries/use-currencies";
import ConfirmationModal from "@/components/ConfirmationModal";
import { BudgetModel } from "@/models/budgets";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import BudgetTransactionList from "@/components/budget/BudgetTransactionList";

const Budget = () => {
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetModel | undefined>(undefined);
  const [viewingBudget, setViewingBudget] = useState<BudgetModel | null>(null);
  const { mutate: deleteBudget } = useDeleteBudget();
  const { data: budgets, isLoading } = useBudgets();
  const { data: currencies } = useCurrencies();

  const handleEdit = (budget: BudgetModel) => {
    setSelectedBudget(budget);
    setIsDialogOpen(true);
  };

  const handleView = (budget: BudgetModel) => {
    setViewingBudget(budget);
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

  const handleBackToList = () => {
    setViewingBudget(null);
  };

  // If viewing a specific budget, show the transaction list
  if (viewingBudget) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleBackToList}
                size="sm"
              >
                ← Kembali ke Daftar Budget
              </Button>
            </div>
            <BudgetTransactionList budget={viewingBudget} />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const renderBudgetItem = (budget: BudgetModel) => (
    <Card key={budget.id} className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="font-semibold">{budget.name}</h3>
          <p className="text-sm text-muted-foreground">
            {budget.currency_code} {budget.amount.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleView(budget)}
          >
            <Eye className="w-3 h-3 mr-1" />
            Detail
          </Button>
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
  );

  const columnFilters: ColumnFilter[] = [
    {
      field: "currency_code",
      label: "Mata Uang",
      type: "select",
      options: currencies?.map(currency => ({
        label: `${currency.code} (${currency.symbol})`,
        value: currency.code
      })) || []
    },
    {
      field: "amount",
      label: "Jumlah Min",
      type: "number"
    },
    {
      field: "start_date",
      label: "Tanggal Mulai",
      type: "date"
    },
    {
      field: "end_date",
      label: "Tanggal Berakhir",
      type: "date"
    }
  ];

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

        <DataTable
          data={budgets || []}
          isLoading={isLoading}
          searchPlaceholder="Cari budget..."
          searchFields={["name", "currency_code"]}
          columnFilters={columnFilters}
          renderItem={renderBudgetItem}
          emptyStateMessage="Belum ada budget yang dibuat"
          title="Manajemen Budget"
          description="Kelola anggaran keuangan Anda"
          headerActions={
            budgets && budgets.length > 0 && (
              <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Budget
              </Button>
            )
          }
        />

        {(!budgets || budgets.length === 0) && !isLoading && (
          <div className="text-center py-8">
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Buat Budget Pertama
            </Button>
          </div>
        )}

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
