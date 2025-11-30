import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import GoalDialog from "@/components/goal/GoalDialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import { GoalModel } from "@/models/goals";
import { useDeleteGoal } from "@/hooks/queries/use-goals";
import { useGoalsPaginated } from "@/hooks/queries/paginated/use-goals-paginated";
import { useCurrencies } from "@/hooks/queries/use-currencies";
import { useMoneySummary } from "@/hooks/queries/use-money-summary";
import { useTableState } from "@/hooks/use-table-state";
import { GoalTable } from "@/components/goal/GoalTable";

const Goal = () => {
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalModel | undefined>(undefined);

  const { mutate: deleteGoal } = useDeleteGoal();

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

  const handleEdit = (goal: GoalModel) => {
    setSelectedGoal(goal);
    setIsDialogOpen(true);
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

  const handleAddNew = () => {
    setSelectedGoal(undefined);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["goals_paginated"] });
    queryClient.invalidateQueries({ queryKey: ["goals"] });
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
            <Button onClick={handleAddNew}>
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
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            currencyOptions={currencyOptions}
            goalFundsSummary={groupedByGoalId}
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
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          goal={selectedGoal}
          onSuccess={handleSuccess}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default Goal;