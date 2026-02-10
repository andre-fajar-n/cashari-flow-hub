import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import BudgetDialog from "@/components/budget/BudgetDialog";
import Layout from "@/components/Layout";
import PageLoading from "@/components/PageLoading";
import { useCreateBudget, useUpdateBudget, useDeleteBudget } from "@/hooks/queries/use-budgets";
import { useBudgetsPaginated } from "@/hooks/queries/paginated/use-budgets-paginated";
import { useBudgetSummary } from "@/hooks/queries/use-budget-summary";
import { DeleteConfirmationModal, useDeleteConfirmation } from "@/components/DeleteConfirmationModal";
import { BudgetModel, BudgetSummary } from "@/models/budgets";
import { BudgetTable } from "@/components/budget/BudgetTable";
import { useTableState } from "@/hooks/use-table-state";
import { BudgetFormData, defaultBudgetFormValues } from "@/form-dto/budget";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useDialogState } from "@/hooks/use-dialog-state";
import { useUserSettings } from "@/hooks/queries/use-user-settings";

const Budget = () => {
  const navigate = useNavigate();

  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const { mutate: deleteBudget } = useDeleteBudget();

  // Form state managed at page level
  const form = useForm<BudgetFormData>({
    defaultValues: defaultBudgetFormValues,
  });

  // Dialog state using reusable hook
  const dialog = useDialogState<BudgetModel, BudgetFormData>({
    form,
    defaultValues: defaultBudgetFormValues,
    mapDataToForm: (budget) => ({
      name: budget.name || "",
      amount: budget.amount || 0,
      start_date: budget.start_date || "",
      end_date: budget.end_date || "",
    }),
  });

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

  const budgetSummariesMap = budgetSummary?.reduce((acc, item) => {
    if (!acc[item.budget_id]) {
      acc[item.budget_id] = [];
    }
    acc[item.budget_id].push(item);
    return acc;
  }, {} as Record<number, BudgetSummary[]>);

  // Combine all loading states
  const isLoading = isLoadingBudgets || isLoadingBudgetSummary || isLoadingUserSettings;

  // Delete confirmation hook
  const deleteConfirmation = useDeleteConfirmation<number>({
    title: "Hapus Budget",
    description: "Apakah Anda yakin ingin menghapus budget ini? Tindakan ini tidak dapat dibatalkan.",
  });

  // Mutation callbacks
  const { handleSuccess, handleError } = useMutationCallbacks({
    setIsLoading: dialog.setIsLoading,
    onOpenChange: (open) => !open && dialog.close(),
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.BUDGETS
  });

  const handleFormSubmit = (data: BudgetFormData) => {
    dialog.setIsLoading(true);
    if (dialog.selectedData) {
      updateBudget.mutate({ id: dialog.selectedData.id, ...data }, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    } else {
      createBudget.mutate(data, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <PageLoading message="Memuat data budget..." />
        </Layout>
      </ProtectedRoute>
    );
  }

  const handleView = (budget: BudgetModel) => {
    navigate(`/budget/${budget.id}`);
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
            <Button onClick={dialog.openAdd}>
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
            onPageChange={tableActions.handlePageChange}
            onPageSizeChange={tableActions.handlePageSizeChange}
            onSearchChange={tableActions.handleSearchChange}
            onFiltersChange={tableActions.handleFiltersChange}
            onEdit={dialog.openEdit}
            onDelete={deleteConfirmation.openModal}
            onView={handleView}
            budgetSummariesMap={budgetSummariesMap}
            userSettings={userSettings}
          />
        </div>

        <DeleteConfirmationModal
          deleteConfirmation={deleteConfirmation}
          onConfirm={(id) => deleteBudget(id)}
        />

        <BudgetDialog
          open={dialog.open}
          onOpenChange={(open) => !open && dialog.close()}
          form={form}
          isLoading={dialog.isLoading}
          onSubmit={handleFormSubmit}
          budget={dialog.selectedData}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default Budget;
