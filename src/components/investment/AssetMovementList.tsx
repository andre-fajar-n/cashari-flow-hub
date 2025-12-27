import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useMoneyMovementsPaginatedByAsset } from "@/hooks/queries/paginated/use-money-movements-paginated";
import { useCategories, useInvestmentCategories } from "@/hooks/queries/use-categories";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useTableState } from "@/hooks/use-table-state";
import { SelectFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { TransactionHistoryTable } from "@/components/transactions/TransactionHistoryTable";
import { getTransactionHistoryColumns } from "@/components/transactions/TransactionHistoryColumns";
import { MoneyMovementModel } from "@/models/money-movements";
import { MOVEMENT_TYPES } from "@/constants/enums";
import { useDeleteGoalInvestmentRecord, useCreateGoalInvestmentRecord, useUpdateGoalInvestmentRecord, useDeleteGoalTransfer, useCreateGoalTransfer, useUpdateGoalTransfer, useGoalInvestmentRecords, useGoals, useGoalTransfers, useInvestmentInstruments, useInvestmentAssets } from "@/hooks/queries";
import { GoalTransferModel } from "@/models/goal-transfers";
import { GoalInvestmentRecordModel } from "@/models/goal-investment-records";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import { GoalTransferFormData, defaultGoalTransferFormData } from "@/form-dto/goal-transfers";
import { GoalInvestmentRecordFormData, defaultGoalInvestmentRecordFormData } from "@/form-dto/goal-investment-records";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";

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

  // Form loading states
  const [isTransferFormLoading, setIsTransferFormLoading] = useState(false);
  const [isRecordFormLoading, setIsRecordFormLoading] = useState(false);

  // Form states
  const transferForm = useForm<GoalTransferFormData>({
    defaultValues: defaultGoalTransferFormData,
  });

  const recordForm = useForm<GoalInvestmentRecordFormData>({
    defaultValues: defaultGoalInvestmentRecordFormData,
  });

  const { data: paged, isLoading: isMovementsLoading } = useMoneyMovementsPaginatedByAsset(assetId, {
    page: tableState.page,
    itemsPerPage: tableState.pageSize,
    searchTerm: tableState.searchTerm,
    filters: tableState.filters
  });

  const { mutateAsync: deleteGoalTransfer } = useDeleteGoalTransfer();
  const { mutateAsync: deleteInvestmentRecord } = useDeleteGoalInvestmentRecord();
  const createGoalTransfer = useCreateGoalTransfer();
  const updateGoalTransfer = useUpdateGoalTransfer();
  const createRecord = useCreateGoalInvestmentRecord();
  const updateRecord = useUpdateGoalInvestmentRecord();

  const { data: categories } = useCategories();
  const { data: investmentCategories } = useInvestmentCategories();
  const { data: wallets } = useWallets();
  const { data: goals } = useGoals();
  const { data: instruments } = useInvestmentInstruments();
  const { data: assets } = useInvestmentAssets();

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

  // Reset transfer form when dialog opens
  useEffect(() => {
    if (goalTransferDialog.open) {
      const transfer = goalTransferDialog.transfer;
      if (transfer) {
        transferForm.reset({
          from_wallet_id: transfer.from_wallet_id || 0,
          from_goal_id: transfer.from_goal_id || 0,
          from_instrument_id: transfer.from_instrument_id || 0,
          from_asset_id: transfer.from_asset_id || 0,
          to_wallet_id: transfer.to_wallet_id || 0,
          to_goal_id: transfer.to_goal_id || 0,
          to_instrument_id: transfer.to_instrument_id || 0,
          to_asset_id: transfer.to_asset_id || 0,
          from_amount: transfer.from_amount || 0,
          to_amount: transfer.to_amount || 0,
          from_amount_unit: transfer.from_amount_unit,
          to_amount_unit: transfer.to_amount_unit,
          date: transfer.date || new Date().toISOString().split("T")[0],
        });
      } else {
        transferForm.reset(defaultGoalTransferFormData);
      }
    }
  }, [goalTransferDialog.open, goalTransferDialog.transfer, transferForm]);

  // Reset record form when dialog opens
  useEffect(() => {
    if (investmentDialog.open) {
      const record = investmentDialog.record;
      if (record) {
        recordForm.reset({
          goal_id: record.goal_id || null,
          instrument_id: record.instrument_id || null,
          asset_id: record.asset_id || null,
          wallet_id: record.wallet_id || null,
          category_id: record.category_id || null,
          amount: record.amount || 0,
          amount_unit: record.amount_unit,
          date: record.date || new Date().toISOString().split("T")[0],
          description: record.description || "",
          is_valuation: record.is_valuation || false,
        });
      } else {
        recordForm.reset(defaultGoalInvestmentRecordFormData);
      }
    }
  }, [investmentDialog.open, investmentDialog.record, recordForm]);

  // Mutation callbacks
  const { handleSuccess: handleTransferSuccess, handleError: handleTransferError } = useMutationCallbacks({
    setIsLoading: setIsTransferFormLoading,
    onOpenChange: (open) => setGoalTransferDialog({ open }),
    form: transferForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.GOAL_TRANSFERS
  });

  const { handleSuccess: handleRecordSuccess, handleError: handleRecordError } = useMutationCallbacks({
    setIsLoading: setIsRecordFormLoading,
    onOpenChange: (open) => setInvestmentDialog({ open }),
    form: recordForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.INVESTMENT_RECORDS
  });

  const handleTransferFormSubmit = (data: GoalTransferFormData) => {
    setIsTransferFormLoading(true);

    const transferData = {
      from_wallet_id: data.from_wallet_id > 0 ? data.from_wallet_id : null,
      from_goal_id: data.from_goal_id > 0 ? data.from_goal_id : null,
      from_instrument_id: data.from_instrument_id > 0 ? data.from_instrument_id : null,
      from_asset_id: data.from_asset_id > 0 ? data.from_asset_id : null,
      to_wallet_id: data.to_wallet_id > 0 ? data.to_wallet_id : null,
      to_goal_id: data.to_goal_id > 0 ? data.to_goal_id : null,
      to_instrument_id: data.to_instrument_id > 0 ? data.to_instrument_id : null,
      to_asset_id: data.to_asset_id > 0 ? data.to_asset_id : null,
      from_amount: data.from_amount,
      to_amount: data.to_amount,
      from_amount_unit: data.from_amount_unit || null,
      to_amount_unit: data.to_amount_unit || null,
      date: data.date,
    };

    if (goalTransferDialog.transfer) {
      updateGoalTransfer.mutate({ id: goalTransferDialog.transfer.id, ...transferData }, {
        onSuccess: handleTransferSuccess,
        onError: handleTransferError
      });
    } else {
      createGoalTransfer.mutate(transferData, {
        onSuccess: handleTransferSuccess,
        onError: handleTransferError
      });
    }
  };

  const handleRecordFormSubmit = (data: GoalInvestmentRecordFormData) => {
    setIsRecordFormLoading(true);

    const cleanData = { ...data };
    cleanData.wallet_id = data.wallet_id || null;
    cleanData.category_id = data.category_id || null;
    if (!data.instrument_id) cleanData.instrument_id = null;
    if (!data.asset_id) cleanData.asset_id = null;
    cleanData.amount_unit = data.amount_unit;

    if (investmentDialog.record) {
      updateRecord.mutate({ id: investmentDialog.record.id, ...cleanData }, {
        onSuccess: handleRecordSuccess,
        onError: handleRecordError
      });
    } else {
      createRecord.mutate(cleanData, {
        onSuccess: handleRecordSuccess,
        onError: handleRecordError
      });
    }
  };

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
        form={transferForm}
        isLoading={isTransferFormLoading}
        onSubmit={handleTransferFormSubmit}
        transfer={goalTransferDialog.transfer}
        wallets={wallets}
        goals={goals}
        instruments={instruments}
        assets={assets}
      />

      <GoalInvestmentRecordDialog
        open={investmentDialog.open}
        onOpenChange={(open) => setInvestmentDialog({ open })}
        form={recordForm}
        isLoading={isRecordFormLoading}
        onSubmit={handleRecordFormSubmit}
        record={investmentDialog.record}
        goals={goals}
        instruments={instruments}
        assets={assets}
        wallets={wallets}
        categories={investmentCategories}
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
