import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionDropdown } from "@/components/ui/action-dropdown";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { ArrowUpRight, ArrowDownLeft, MoreHorizontal, Edit, Trash2, ArrowLeftRight } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { Database } from "@/integrations/supabase/types";
import { AmountText } from "@/components/ui/amount-text";
import { useDeleteGoalInvestmentRecord, useGoalInvestmentRecords } from "@/hooks/queries/use-goal-investment-records";
import { useToast } from "@/hooks/use-toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import { useDeleteGoalTransfer } from "@/hooks/queries/use-goal-transfers";

export interface MovementsDataTableProps {
  movements: Database["public"]["Views"]["money_movements"]["Row"][];
  transfers: Database["public"]["Tables"]["goal_transfers"]["Row"][];
  filterType: 'goal' | 'asset';
  filterId: number;
  title: string;
  description: string;
  emptyMessage?: string;
}

const MovementsDataTable = ({
  movements,
  transfers,
  filterType,
  filterId,
  title,
  description,
  emptyMessage = "Belum ada riwayat pergerakan dana"
}: MovementsDataTableProps) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    type: 'transfer' | 'record' | null;
    id: number | null;
    movementId?: string | null;
  }>({ open: false, type: null, id: null, movementId: null });

  // Edit dialog states
  const [editTransferDialog, setEditTransferDialog] = useState<{
    open: boolean;
    transfer: Database["public"]["Tables"]["goal_transfers"]["Row"] | null;
  }>({ open: false, transfer: null });

  const [editRecordDialog, setEditRecordDialog] = useState<{
    open: boolean;
    record: Database["public"]["Tables"]["goal_investment_records"]["Row"] | null;
  }>({ open: false, record: null });

  const { toast } = useToast();
  const deleteRecord = useDeleteGoalInvestmentRecord();
  const deleteTransfer = useDeleteGoalTransfer();

  // Fetch data for editing
  const { data: allRecords } = useGoalInvestmentRecords();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filter movements based on type and ID
  const filteredMovements = movements.filter(movement => {
    if (filterType === 'goal') {
      return movement.goal_id === filterId;
    } else if (filterType === 'asset') {
      return movement.asset_id === filterId;
    }
    return false;
  });

  // Create a mapping of goal transfers by ID for quick lookup
  const transfersMap = new Map();
  transfers.forEach(transfer => {
    transfersMap.set(transfer.id, transfer);
  });

  // Function to get detailed description for goal transfers
  const getTransferDescription = (movement: any) => {
    if ((movement.resource_type === 'goal_transfers_in' || movement.resource_type === 'goal_transfers_out') && movement.resource_id) {
      const transfer = transfersMap.get(movement.resource_id);
      if (transfer) {
        const lines = [];

        // Handle wallet transfers
        if (transfer.from_wallet_id && transfer.to_wallet_id) {
          let desc = `${transfer.from_wallet?.name || 'Unknown'} → ${transfer.to_wallet?.name || 'Unknown'}`;
          if (transfer.from_wallet_id === transfer.to_wallet_id) {
            desc = `${transfer.from_wallet?.name || 'Unknown'}`;
          }
          lines.push(`Dompet: ${desc}`);
        } else if (transfer.from_wallet_id) {
          lines.push(`Dari Dompet: ${transfer.from_wallet?.name || 'Unknown'}`);
        } else if (transfer.to_wallet_id) {
          lines.push(`Ke Dompet: ${transfer.to_wallet?.name || 'Unknown'}`);
        }

        // Handle goal transfers
        if (transfer.from_goal_id && transfer.to_goal_id) {
          let desc = `${transfer.from_goal?.name || 'Unknown'} → ${transfer.to_goal?.name || 'Unknown'}`;
          if (transfer.from_goal_id === transfer.to_goal_id) {
            desc = `${transfer.from_goal?.name || 'Unknown'}`;
          }
          lines.push(`Goal: ${desc}`);
        } else if (transfer.from_goal_id) {
          lines.push(`Dari Goal: ${transfer.from_goal?.name || 'Unknown'}`);
        } else if (transfer.to_goal_id) {
          lines.push(`Ke Goal: ${transfer.to_goal?.name || 'Unknown'}`);
        }

        // Handle instrument transfers
        if (transfer.from_instrument_id && transfer.to_instrument_id) {
          let desc = `${transfer.from_instrument?.name || 'Unknown'} → ${transfer.to_instrument?.name || 'Unknown'}`;
          if (transfer.from_instrument_id === transfer.to_instrument_id) {
            desc = `${transfer.from_instrument?.name || 'Unknown'}`;
          }
          lines.push(`Instrumen: ${desc}`);
        } else if (transfer.from_instrument_id) {
          lines.push(`Dari Instrumen: ${transfer.from_instrument?.name || 'Unknown'}`);
        } else if (transfer.to_instrument_id) {
          lines.push(`Ke Instrumen: ${transfer.to_instrument?.name || 'Unknown'}`);
        }

        // Handle asset transfers
        if (transfer.from_asset_id && transfer.to_asset_id) {
          let desc = `${transfer.from_asset?.name || 'Unknown'}${transfer.from_asset?.symbol ? ` (${transfer.from_asset?.symbol})` : ''} → ${transfer.to_asset?.name || 'Unknown'}${transfer.to_asset?.symbol ? ` (${transfer.to_asset?.symbol})` : ''}`;
          if (transfer.from_asset_id === transfer.to_asset_id) {
            desc = `${transfer.from_asset?.name || 'Unknown'}${transfer.from_asset?.symbol ? ` (${transfer.from_asset?.symbol})` : ''}`;
          }
          lines.push(`Aset: ${desc}`);
        } else if (transfer.from_asset_id) {
          lines.push(`Dari Aset: ${transfer.from_asset?.name || 'Unknown'}${transfer.from_asset?.symbol ? ` (${transfer.from_asset?.symbol})` : ''}`);
        } else if (transfer.to_asset_id) {
          lines.push(`Ke Aset: ${transfer.to_asset?.name || 'Unknown'}${transfer.to_asset?.symbol ? ` (${transfer.to_asset?.symbol})` : ''}`);
        }

        return lines;
      }
    }

    // Fallback to original description
    return [movement.description || 'Deskripsi kosong'];
  };

  const handleEdit = (movement: any) => {
    if (movement.resource_type === 'goal_transfers_in' || movement.resource_type === 'goal_transfers_out') {
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
    } else if (movement.resource_type === 'investment_growth') {
      // Find the investment record data using movement.id as unique identifier
      const record = allRecords?.find(r => r.id === movement.resource_id);
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

  const handleDelete = (movement: any) => {
    let type: 'transfer' | 'record' | null = null;

    if (movement.resource_type === 'goal_transfers_in' || movement.resource_type === 'goal_transfers_out') {
      type = 'transfer';
    } else if (movement.resource_type === 'investment_growth') {
      type = 'record';
    }

    if (type && movement.resource_id) {
      setDeleteModal({
        open: true,
        type,
        id: movement.resource_id,
        movementId: movement.id // Store movement ID for reference
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

  // Define column filters for the data table
  const columnFilters: ColumnFilter[] = [
    {
      field: 'resource_type',
      label: 'Tipe',
      type: 'select',
      options: [
        { label: 'Transfer Masuk', value: 'goal_transfers_in' },
        { label: 'Transfer Keluar', value: 'goal_transfers_out' },
        { label: 'Pertumbuhan Investasi', value: 'investment_growth' },
      ]
    },
    {
      field: 'currency_code',
      label: 'Mata Uang',
      type: 'select',
      options: [
        { label: 'IDR', value: 'IDR' },
        { label: 'USD', value: 'USD' },
      ]
    },
    {
      field: 'date',
      label: 'Tanggal',
      type: 'daterange'
    },
  ];

  // Render function for each movement item
  const renderMovementItem = (movement: any) => {
    // Create unique identifier using movement.id (from money_movements table)
    const uniqueId = `movement-${movement.id}`;
    
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {movement.amount !== null && movement.amount !== undefined ? (
              movement.amount === 0 ? (
                <ArrowLeftRight className="w-5 h-5 text-blue-600" />
              ) : (
                movement.amount > 0 ? (
                  <ArrowDownLeft className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-red-600" />
                )
              )
            ) : null}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {movement.amount !== null && movement.amount !== undefined ? (
                  movement.amount === 0 ? 'Transfer' :
                  movement.amount > 0 ? 'Dana Masuk' : 'Dana Keluar'
                ) : 'Transfer'}
              </p>
              <Badge variant="outline" className="text-xs">
                {movement.resource_type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {getTransferDescription(movement).map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(movement.date || '')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <AmountText
              amount={movement.amount || 0}
              className="font-semibold"
              showSign={true}
            >
              {formatAmountCurrency(Math.abs(movement.amount || 0), movement.currency_code || 'unknown currency')}
            </AmountText>
            {movement.amount_unit !== null ? (
              <p className="text-sm text-muted-foreground">
                {movement.amount_unit.toLocaleString("id-ID", { maximumFractionDigits: 4 })} {movement.unit_label || 'unknown unit'}
              </p>
            ): null}
          </div>
          <ActionDropdown
            dropdownId={uniqueId}
            openDropdownId={openDropdownId}
            setOpenDropdownId={setOpenDropdownId}
            triggerContent={
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            }
            menuItems={[
              {
                label: "Edit",
                icon: <Edit className="w-4 h-4" />,
                onClick: () => handleEdit(movement),
              },
              {
                label: "Hapus",
                icon: <Trash2 className="w-4 h-4" />,
                onClick: () => handleDelete(movement),
                className: "text-destructive",
              },
            ]}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <DataTable
        data={filteredMovements}
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
        }}
      />
    </>
  );
};

export default MovementsDataTable;
