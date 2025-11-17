import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import BudgetDialog from "@/components/budget/BudgetDialog";
import Layout from "@/components/Layout";
import { useDeleteBudget } from "@/hooks/queries/use-budgets";
import { useBudgetsPaginated } from "@/hooks/queries/paginated/use-budgets-paginated";
import { useBudgetSummary } from "@/hooks/queries/use-budget-summary";
import { useCurrencies } from "@/hooks/queries/use-currencies";
import ConfirmationModal from "@/components/ConfirmationModal";
import { BudgetModel } from "@/models/budgets";
import { useUserSettings } from "@/hooks/queries/use-user-settings";
import { BudgetTable } from "@/components/budget/BudgetTable";
import { useTableState } from "@/hooks/use-table-state";
import { SelectFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";

const Budget = () => {
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetModel | undefined>(undefined);
  const navigate = useNavigate();
  const { mutate: deleteBudget } = useDeleteBudget();

  // Table state management using generic hook
  const { state: tableState, actions: tableActions } = useTableState({
    initialPage: 1,
    initialPageSize: 10,
  });

  const { data: paged, isLoading: isLoadingBudgets } = useBudgetsPaginated({
    page: tableState.page,
    itemsPerPage: tableState.pageSize,
    searchTerm: tableState.searchTerm,
    filters: tableState.filters
  });
  const budgets = paged?.data || [];
  const totalCount = paged?.count || 0;

  const { data: budgetSummary, isLoading: isLoadingBudgetSummary } = useBudgetSummary();
  const { data: userSettings, isLoading: isLoadingUserSettings } = useUserSettings();

  // Combine all loading states
  const isLoading = isLoadingBudgets || isLoadingBudgetSummary || isLoadingUserSettings;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </Layout>
      </ProtectedRoute>)
  }

  const handleEdit = (budget: BudgetModel) => {
    setSelectedBudget(budget);
    setIsDialogOpen(true);
  };

  const handleView = (budget: BudgetModel) => {
    navigate(`/budget/${budget.id}`);
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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Budget</h1>
              <p className="text-sm text-muted-foreground mt-1">Kelola anggaran keuangan Anda</p>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Budget
            </Button>
          </div>

          {/* Budget Table */}
          <BudgetTable
            budgets={budgets}
            isLoading={isLoading}
            totalCount={totalCount}
            page={tableState.page}
            pageSize={tableState.pageSize}
            searchTerm={tableState.searchTerm}
            filters={tableState.filters}
            onPageChange={tableActions.setPage}
            onPageSizeChange={tableActions.setPageSize}
            onSearchChange={tableActions.setSearchTerm}
            onFiltersChange={tableActions.setFilters}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onView={handleView}
            budgetSummary={budgetSummary}
            baseCurrencyCode={userSettings?.base_currency_code || ''}
          />
        </div>

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
