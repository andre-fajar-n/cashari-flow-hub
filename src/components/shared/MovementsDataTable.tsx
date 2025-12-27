import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { useDeleteGoalInvestmentRecord, useCreateGoalInvestmentRecord, useUpdateGoalInvestmentRecord } from "@/hooks/queries/use-goal-investment-records";
import { useDeleteGoalTransfer, useCreateGoalTransfer, useUpdateGoalTransfer } from "@/hooks/queries/use-goal-transfers";
import { useInvestmentCategories } from "@/hooks/queries/use-categories";
import { useToast } from "@/hooks/use-toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import { GoalTransferModel } from "@/models/goal-transfers";
import { GoalInvestmentRecordModel } from "@/models/goal-investment-records";
import { WalletModel } from "@/models/wallets";
import { GoalModel } from "@/models/goals";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { InvestmentAssetModel } from "@/models/investment-assets";
import { MoneyMovementModel } from "@/models/money-movements";
import { MOVEMENT_TYPES } from "@/constants/enums";
import { CommonItem } from "@/components/ui/transaction-items";
import { GoalTransferFormData, defaultGoalTransferFormData } from "@/form-dto/goal-transfers";
import { GoalInvestmentRecordFormData, defaultGoalInvestmentRecordFormData } from "@/form-dto/goal-investment-records";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";

export interface MovementsDataTableProps {
  movements: MoneyMovementModel[];
  transfers: GoalTransferModel[];
  records: GoalInvestmentRecordModel[];
  wallets: WalletModel[];
  goals?: GoalModel[];
  instruments?: InvestmentInstrumentModel[];
  assets?: InvestmentAssetModel[];
  filterType: 'goal' | 'instrument' | 'asset';
  title: string;
  description: string;
  emptyMessage?: string;
  onSuccess?: () => void;
}

const MovementsDataTable = ({
  movements,
  transfers,
  records,
  wallets,
  goals = [],
  instruments = [],
  assets = [],
  filterType,
  title,
  description,
  emptyMessage = "Belum ada riwayat pergerakan dana",
  onSuccess
}: MovementsDataTableProps) => {
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    type: 'transfer' | 'record' | null;
    id: number | null;
    movementId?: string | null;
  }>({ open: false, type: null, id: null, movementId: null });

  // Edit dialog states
  const [editTransferDialog, setEditTransferDialog] = useState<{
    open: boolean;
    transfer: GoalTransferModel | null;
  }>({ open: false, transfer: null });

  const [editRecordDialog, setEditRecordDialog] = useState<{
    open: boolean;
    record: GoalInvestmentRecordModel | null;
  }>({ open: false, record: null });

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

  const { toast } = useToast();
  const deleteRecord = useDeleteGoalInvestmentRecord();
  const deleteTransfer = useDeleteGoalTransfer();
  const createGoalTransfer = useCreateGoalTransfer();
  const updateGoalTransfer = useUpdateGoalTransfer();
  const createRecord = useCreateGoalInvestmentRecord();
  const updateRecord = useUpdateGoalInvestmentRecord();
  const { data: investmentCategories } = useInvestmentCategories();

  // Reset transfer form when dialog opens
  useEffect(() => {
    if (editTransferDialog.open) {
      const transfer = editTransferDialog.transfer;
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
  }, [editTransferDialog.open, editTransferDialog.transfer, transferForm]);

  // Reset record form when dialog opens
  useEffect(() => {
    if (editRecordDialog.open) {
      const record = editRecordDialog.record;
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
  }, [editRecordDialog.open, editRecordDialog.record, recordForm]);

  // Mutation callbacks
  const { handleSuccess: handleTransferSuccess, handleError: handleTransferError } = useMutationCallbacks({
    setIsLoading: setIsTransferFormLoading,
    onOpenChange: (open) => setEditTransferDialog({ open, transfer: null }),
    form: transferForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.GOAL_TRANSFERS,
    onSuccess
  });

  const { handleSuccess: handleRecordSuccess, handleError: handleRecordError } = useMutationCallbacks({
    setIsLoading: setIsRecordFormLoading,
    onOpenChange: (open) => setEditRecordDialog({ open, record: null }),
    form: recordForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.INVESTMENT_RECORDS,
    onSuccess
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

    if (editTransferDialog.transfer) {
      updateGoalTransfer.mutate({ id: editTransferDialog.transfer.id, ...transferData }, {
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

    if (editRecordDialog.record) {
      updateRecord.mutate({ id: editRecordDialog.record.id, ...cleanData }, {
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

  const handleEdit = (movement: MoneyMovementModel) => {
    if (movement.resource_type === MOVEMENT_TYPES.GOAL_TRANSFER) {
      // Find the transfer data using movement.id as unique identifier
      const transfer = transfers?.find(t => t.id === movement.resource_id);
      if (transfer) {
        setEditTransferDialog({ open: true, transfer });
      } else {
        toast({
          title: "Error",
          description: `Data transfer tidak ditemukan (Movement ID: ${movement.id})`,
          variant: "destructive",
        });
      }
    } else if (movement.resource_type === MOVEMENT_TYPES.INVESTMENT_GROWTH) {
      // Find the investment record data using movement.id as unique identifier
      const record = records?.find(r => r.id === movement.resource_id);
      if (record) {
        setEditRecordDialog({ open: true, record });
      } else {
        toast({
          title: "Error",
          description: `Data investment record tidak ditemukan (Movement ID: ${movement.id})`,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Info",
        description: "Tipe movement ini belum dapat diedit",
      });
    }
  };

  const handleDelete = (movement: MoneyMovementModel) => {
    let type: 'transfer' | 'record' | null = null;

    if (movement.resource_type === MOVEMENT_TYPES.GOAL_TRANSFER) {
      type = 'transfer';
    } else if (movement.resource_type === MOVEMENT_TYPES.INVESTMENT_GROWTH) {
      type = 'record';
    }

    if (type && movement.resource_id) {
      setDeleteModal({
        open: true,
        type,
        id: movement.resource_id,
        movementId: movement.id.toString() // Store movement ID for reference
      });
    }
  };

  const handleConfirmDelete = () => {
    const handleDeleteSuccess = () => {
      setDeleteModal({ open: false, type: null, id: null });
    };

    if (deleteModal.type === 'transfer' && deleteModal.id) {
      deleteTransfer.mutate(deleteModal.id, {
        onSuccess: handleDeleteSuccess
      });
    } else if (deleteModal.type === 'record' && deleteModal.id) {
      deleteRecord.mutate(deleteModal.id, {
        onSuccess: handleDeleteSuccess
      });
    }
  };

  // Define column filters for the data table, starting with resource_type
  let columnFilters: ColumnFilter[] = [
    {
      field: 'resource_type',
      label: 'Tipe',
      type: 'select',
      options: [
        { label: 'Transfer', value: MOVEMENT_TYPES.GOAL_TRANSFER },
        { label: 'Pertumbuhan Investasi', value: MOVEMENT_TYPES.INVESTMENT_GROWTH },
      ]
    },
    {
      field: "wallet_id",
      label: "Dompet",
      type: "select",
      options: wallets?.map(wallet => ({
        label: wallet.name,
        value: wallet.id.toString()
      })) || []
    },
  ];

  // if filterType is not goal, add goal_id filter
  if (filterType !== 'goal') {
    columnFilters.push({
      field: "goal_id",
      label: "Goal",
      type: "select",
      options: goals?.map(goal => ({
        label: goal.name,
        value: goal.id.toString()
      })) || []
    });
  }

  // if filterType is not instrument, add instrument_id filter
  if (filterType !== 'instrument') {
    columnFilters.push({
      field: "instrument_id",
      label: "Instrumen",
      type: "select",
      options: instruments?.map(instrument => ({
        label: instrument.name,
        value: instrument.id.toString()
      })) || []
    });
  }

  // if filterType is not asset, add asset_id filter
  if (filterType !== 'asset') {
    columnFilters.push({
      field: "asset_id",
      label: "Aset",
      type: "select",
      options: assets?.map(asset => ({
        label: asset.name,
        value: asset.id.toString()
      })) || []
    });
  }

  columnFilters.push({
    field: 'date',
    label: 'Tanggal',
    type: 'daterange'
  });

  // Render function for each movement item
  const renderMovementItem = (movement: MoneyMovementModel) => {
    // Create unique identifier using movement.id (from money_movements table)
    const uniqueId = `movement-${movement.id}`;
    
    return (
      <CommonItem
        key={uniqueId}
        movement={movement}
        onEdit={() => handleEdit(movement)}
        onDelete={() => handleDelete(movement)}
      />
    );
  };

  return (
    <>
      <DataTable
        data={movements}
        isLoading={false}
        searchPlaceholder="Cari riwayat pergerakan dana..."
        searchFields={["description", "resource_type"]}
        columnFilters={columnFilters}
        renderItem={renderMovementItem}
        emptyStateMessage={emptyMessage}
        title={title}
        description={description}
      />

      <ConfirmationModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        onConfirm={handleConfirmDelete}
        title="Hapus Item"
        description={`Apakah Anda yakin ingin menghapus ${deleteModal.type === 'transfer' ? 'transfer' : 'record'} ini? Tindakan ini tidak dapat dibatalkan.${deleteModal.movementId ? ` (Movement ID: ${deleteModal.movementId})` : ''}`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="destructive"
      />

      {/* Edit Transfer Dialog */}
      <GoalTransferDialog
        open={editTransferDialog.open}
        onOpenChange={(open) => setEditTransferDialog({ open, transfer: null })}
        form={transferForm}
        isLoading={isTransferFormLoading}
        onSubmit={handleTransferFormSubmit}
        transfer={editTransferDialog.transfer || undefined}
        wallets={wallets}
        goals={goals}
        instruments={instruments}
        assets={assets}
      />

      {/* Edit Investment Record Dialog */}
      <GoalInvestmentRecordDialog
        open={editRecordDialog.open}
        onOpenChange={(open) => setEditRecordDialog({ open, record: null })}
        form={recordForm}
        isLoading={isRecordFormLoading}
        onSubmit={handleRecordFormSubmit}
        record={editRecordDialog.record}
        goals={goals}
        instruments={instruments}
        assets={assets}
        wallets={wallets}
        categories={investmentCategories}
      />
    </>
  );
};

export default MovementsDataTable;
