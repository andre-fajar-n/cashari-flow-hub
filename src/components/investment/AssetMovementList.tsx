import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMoneyMovementsPaginatedByAsset } from "@/hooks/queries/paginated/use-money-movements-paginated";
import { useCategories } from "@/hooks/queries/use-categories";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useTableState } from "@/hooks/use-table-state";
import { SelectFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { TransactionHistoryTable } from "@/components/transactions/TransactionHistoryTable";
import { getTransactionHistoryColumns } from "@/components/transactions/TransactionHistoryColumns";
import { MoneyMovementModel } from "@/models/money-movements";
import { MOVEMENT_TYPES } from "@/constants/enums";
import { useDeleteGoalInvestmentRecord, useDeleteGoalTransfer, useGoalInvestmentRecords, useGoals, useGoalTransfers } from "@/hooks/queries";
import { GoalTransferModel } from "@/models/goal-transfers";
import { GoalInvestmentRecordModel } from "@/models/goal-investment-records";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import ConfirmationModal from "@/components/ConfirmationModal";

interface AssetMovementListProps {
  assetId: number;
}

const AssetMovementList = ({ assetId }: AssetMovementListProps) => {
  const queryClient = useQueryClient();
  const { state: tableState, actions: tableActions } = useTableState({
    initialPage: 1,
    initialPageSize: 10,
  });

  const [goalTransferDialog, setGoalTransferDialog] = useState<{
    open: boolean;
    transfer?: GoalTransferModel;
  }>({ open: false });

  const [investmentDialog, setInvestmentDialog] = useState<{
    open: boolean;
    record?: GoalInvestmentRecordModel;
  }>({ open: false });

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    item?: MoneyMovementModel;
  }>({ open: false });

  const { data: paged, isLoading: isMovementsLoading } = useMoneyMovementsPaginatedByAsset(assetId, {
    page: tableState.page,
    itemsPerPage: tableState.pageSize,
    searchTerm: tableState.searchTerm,
    filters: tableState.filters
  });

  const { mutateAsync: deleteGoalTransfer } = useDeleteGoalTransfer();
  const { mutateAsync: deleteInvestmentRecord } = useDeleteGoalInvestmentRecord();

  const { data: categories } = useCategories();
  const { data: wallets } = useWallets();
  const { data: goals } = useGoals();

  const movements = paged?.data || [];
  const totalCount = paged?.count || 0;

  const goalTransferIds = movements?.filter(m => m.resource_type === MOVEMENT_TYPES.GOAL_TRANSFER).map(m => m.resource_id) || [];
  const { data: goalTransfers, isLoading: isGoalTransfersLoading } = useGoalTransfers({ ids: goalTransferIds });
  const goalTransfersGroupById = goalTransfers?.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<number, GoalTransferModel>);

  const investmentRecordIds = movements?.filter(m => m.resource_type === MOVEMENT_TYPES.INVESTMENT_GROWTH).map(m => m.resource_id) || [];
  const { data: investmentRecords, isLoading: isInvestmentRecordsLoading } = useGoalInvestmentRecords({ ids: investmentRecordIds });
  const investmentRecordsGroupById = investmentRecords?.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<number, GoalInvestmentRecordModel>);

  const isLoading = isMovementsLoading || isGoalTransfersLoading || isInvestmentRecordsLoading;

  const handleEdit = (item: MoneyMovementModel) => {
    switch (item.resource_type) {
      case MOVEMENT_TYPES.GOAL_TRANSFER:
        setGoalTransferDialog({ open: true, transfer: goalTransfersGroupById[item.resource_id] });
        break;
      case MOVEMENT_TYPES.INVESTMENT_GROWTH: ;
        setInvestmentDialog({
          open: true,
          record: investmentRecordsGroupById[item.resource_id],
        });
        break;
    }
  };

  const handleDelete = (movement: MoneyMovementModel) => {
    setDeleteModal({ open: true, item: movement });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.item) return;

    const item = deleteModal.item;
    const itemId = item.resource_id;

    try {
      switch (item.resource_type) {
        case MOVEMENT_TYPES.GOAL_TRANSFER:
          await deleteGoalTransfer(itemId);
          break;
        case MOVEMENT_TYPES.INVESTMENT_GROWTH:
          await deleteInvestmentRecord(itemId);
          break;
      }

      // Refresh data
      setDeleteModal({ open: false });
      queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
    queryClient.invalidateQueries({ queryKey: ["money_movements"] });
    queryClient.invalidateQueries({ queryKey: ["investment_asset_values"] });
    setDeleteModal({ open: false });
  };

  // Generate columns
  const columns = getTransactionHistoryColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  // Select filters configuration
  const selectFilters: SelectFilterConfig[] = [
    {
      key: "resource_type",
      label: "Tipe",
      options: [
        { label: "Transfer Target", value: "goal_transfers" },
        { label: "Progres Investasi", value: "investment_growth" },
      ],
    },
    {
      key: "category_id",
      label: "Kategori",
      placeholder: "Semua Kategori",
      options: categories?.map(category => ({
        label: category.name,
        value: category.id.toString()
      })) || []
    },
    {
      key: "wallet_id",
      label: "Dompet",
      placeholder: "Semua Dompet",
      options: wallets?.map(wallet => ({
        label: `${wallet.name} (${wallet.currency_code})`,
        value: wallet.id.toString()
      })) || []
    },
    {
      key: "goal_id",
      label: "Target",
      placeholder: "Semua Target",
      options: goals?.map(goal => ({
        label: goal.name,
        value: goal.id.toString()
      })) || []
    }
  ];

  // Date range filter configuration
  const dateRangeFilter = {
    key: "date",
    label: "Tanggal",
    placeholder: "Pilih rentang tanggal",
  };

  return (
    <>
      <TransactionHistoryTable
        columns={columns}
        data={movements}
        totalCount={totalCount}
        isLoading={isLoading}
        searchTerm={tableState.searchTerm}
        onSearchChange={tableActions.handleSearchChange}
        filters={tableState.filters}
        onFiltersChange={tableActions.handleFiltersChange}
        selectFilters={selectFilters}
        dateRangeFilter={dateRangeFilter}
        page={tableState.page}
        pageSize={tableState.pageSize}
        setPage={tableActions.handlePageChange}
        setPageSize={tableActions.handlePageSizeChange}
      />

      <GoalTransferDialog
        open={goalTransferDialog.open}
        onOpenChange={(open) => setGoalTransferDialog({ open })}
        transfer={goalTransferDialog.transfer}
        onSuccess={handleSuccess}
      />

      <GoalInvestmentRecordDialog
        open={investmentDialog.open}
        onOpenChange={(open) => setInvestmentDialog({ open })}
        record={investmentDialog.record}
        onSuccess={handleSuccess}
      />

      <ConfirmationModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open })}
        onConfirm={handleConfirmDelete}
        title="Hapus Item"
        description={`Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="destructive"
      />
    </>
  );
};

export default AssetMovementList;

