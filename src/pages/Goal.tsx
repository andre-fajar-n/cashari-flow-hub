import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import GoalDialog from "@/components/goal/GoalDialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import { GoalModel } from "@/models/goals";
import { useCreateGoal, useUpdateGoal, useDeleteGoal } from "@/hooks/queries/use-goals";
import { useGoalsPaginated } from "@/hooks/queries/paginated/use-goals-paginated";
import { useCurrencies } from "@/hooks/queries/use-currencies";
import { useMoneySummary } from "@/hooks/queries/use-money-summary";
import { useTableState } from "@/hooks/use-table-state";
import { GoalTable } from "@/components/goal/GoalTable";
import { CurrencyModel } from "@/models/currencies";
import { GoalFormData, defaultGoalFormValues } from "@/form-dto/goals";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useDialogState } from "@/hooks/use-dialog-state";

const Goal = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);

  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const { mutate: deleteGoal } = useDeleteGoal();

  // Form state managed at page level
  const form = useForm<GoalFormData>({
    defaultValues: defaultGoalFormValues,
  });

  // Dialog state using reusable hook
  const dialog = useDialogState<GoalModel, GoalFormData>({
    form,
    defaultValues: defaultGoalFormValues,
    mapDataToForm: (goal) => ({
      name: goal.name || "",
      target_amount: goal.target_amount || 0,
      currency_code: goal.currency_code || "",
      target_date: goal.target_date || "",
    }),
  });

  // Table state management using generic hook
  const { state: tableState, actions: tableActions } = useTableState({
    initialPage: 1,
    initialPageSize: 10,
  });

  const { data: paged, isLoading: isGoalsLoading } = useGoalsPaginated({
    page: tableState.page,
    itemsPerPage: tableState.pageSize,
    searchTerm: tableState.searchTerm,
    filters: tableState.filters
  });

  const goals = paged?.data || [];
  const totalCount = paged?.count || 0;

  const { data: currencies, isLoading: isCurrencyLoading } = useCurrencies();
  const { data: goalFundsSummary, isLoading: isFundsSummaryLoading } = useMoneySummary({ investmentOnly: true });

  const isLoading = isGoalsLoading || isCurrencyLoading || isFundsSummaryLoading;

  const groupedByGoalId = (goalFundsSummary ?? []).reduce((acc, item) => {
    if (!acc[item.goal_id]) {
      acc[item.goal_id] = {
        goal_id: item.goal_id,
        amount: 0,
      };
    }
    acc[item.goal_id].amount += item.amount || 0;
    return acc;
  }, {} as Record<number, { goal_id: number; amount: number }>);
  const currenciesMap = (currencies ?? []).reduce((acc, currency) => {
    acc[currency.code] = currency;
    return acc;
  }, {} as Record<string, CurrencyModel>);

  // Mutation callbacks
  const { handleSuccess, handleError } = useMutationCallbacks({
    setIsLoading: dialog.setIsLoading,
    onOpenChange: (open) => !open && dialog.close(),
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.GOALS
  });

  const handleFormSubmit = (data: GoalFormData) => {
    dialog.setIsLoading(true);
    if (dialog.selectedData) {
      updateGoal.mutate({ id: dialog.selectedData.id, ...data }, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    } else {
      createGoal.mutate(data, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    }
  };

  const handleDeleteClick = (goalId: number) => {
    setGoalToDelete(goalId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (goalToDelete) {
      deleteGoal(goalToDelete);
    }
  };

  // Currency options for filter
  const currencyOptions = currencies?.map(currency => ({
    label: `${currency.code} (${currency.symbol})`,
    value: currency.code
  })) || [];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Manajemen Target</h1>
              <p className="text-muted-foreground">Kelola target keuangan Anda</p>
            </div>
            <Button onClick={dialog.openAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Target
            </Button>
          </div>

          {/* Table */}
          <GoalTable
            data={goals}
            totalCount={totalCount}
            isLoading={isLoading}
            searchTerm={tableState.searchTerm}
            onSearchChange={tableActions.handleSearchChange}
            filters={tableState.filters}
            onFiltersChange={tableActions.handleFiltersChange}
            page={tableState.page}
            pageSize={tableState.pageSize}
            onPageChange={tableActions.handlePageChange}
            onPageSizeChange={tableActions.handlePageSizeChange}
            onEdit={dialog.openEdit}
            onDelete={handleDeleteClick}
            currencyOptions={currencyOptions}
            goalFundsSummary={groupedByGoalId}
            currenciesMap={currenciesMap}
          />
        </div>

        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          title="Hapus Target"
          description="Apakah Anda yakin ingin menghapus target ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Ya, Hapus"
          cancelText="Batal"
          variant="destructive"
        />

        <GoalDialog
          open={dialog.open}
          onOpenChange={(open) => !open && dialog.close()}
          form={form}
          isLoading={dialog.isLoading}
          onSubmit={handleFormSubmit}
          currencies={currencies}
          goal={dialog.selectedData}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default Goal;
