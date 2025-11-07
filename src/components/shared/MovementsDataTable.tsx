import { useState } from "react";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { useDeleteGoalInvestmentRecord } from "@/hooks/queries/use-goal-investment-records";
import { useToast } from "@/hooks/use-toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import { useDeleteGoalTransfer } from "@/hooks/queries/use-goal-transfers";
import { GoalTransferModel } from "@/models/goal-transfers";
import { GoalInvestmentRecordModel } from "@/models/goal-investment-records";
import { WalletModel } from "@/models/wallets";
import { GoalModel } from "@/models/goals";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { InvestmentAssetModel } from "@/models/investment-assets";
import { MoneyMovementModel } from "@/models/money-movements";
import { MOVEMENT_TYPES } from "@/constants/enums";
import { CommonItem } from "@/components/ui/transaction-items";

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

  const { toast } = useToast();
  const deleteRecord = useDeleteGoalInvestmentRecord();
  const deleteTransfer = useDeleteGoalTransfer();

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
        transfer={editTransferDialog.transfer}
        onSuccess={() => {
          toast({
            title: "Berhasil",
            description: "Transfer berhasil diupdate",
          });
          onSuccess?.();
        }}
      />

      {/* Edit Investment Record Dialog */}
      <GoalInvestmentRecordDialog
        open={editRecordDialog.open}
        onOpenChange={(open) => setEditRecordDialog({ open, record: null })}
        record={editRecordDialog.record}
        onSuccess={() => {
          toast({
            title: "Berhasil",
            description: "Investment record berhasil diupdate",
          });
          onSuccess?.();
        }}
      />
    </>
  );
};

export default MovementsDataTable;
