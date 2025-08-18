import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionDropdown } from "@/components/ui/action-dropdown";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { ArrowUpRight, ArrowDownLeft, MoreHorizontal, Edit, Trash2, ArrowLeftRight } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { Database } from "@/integrations/supabase/types";
import { AmountText } from "@/components/ui/amount-text";
import { useDeleteGoalInvestmentRecord } from "@/hooks/queries/use-goal-investment-records";
import { useToast } from "@/hooks/use-toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import { useDeleteGoalTransfer } from "@/hooks/queries/use-goal-transfers";

export interface MovementsDataTableProps {
  movements: Database["public"]["Views"]["money_movements"]["Row"][];
  transfers: Database["public"]["Tables"]["goal_transfers"]["Row"][];
  records: Database["public"]["Tables"]["goal_investment_records"]["Row"][];
  wallets: Database["public"]["Tables"]["wallets"]["Row"][];
  goals?: Database["public"]["Tables"]["goals"]["Row"][];
  instruments?: Database["public"]["Tables"]["investment_instruments"]["Row"][];
  assets?: Database["public"]["Tables"]["investment_assets"]["Row"][];
  filterType: 'goal' | 'instrument' | 'asset';
  filterId: number;
  title: string;
  description: string;
  emptyMessage?: string;
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
    } else if (filterType === 'instrument') {
      return movement.instrument_id === filterId;
    }
    return false;
  });

  const getDescription = (movement: any) => {
    const lines: Array<{ text: string; highlightedParts?: string[] }> = []
    if (movement.resource_type === 'investment_growth') {
      lines.push({ text: movement.description || '' });
    }

    let walletInfo = `Dompet: ${movement.wallet_name}`;
    let walletHighlights = [movement.wallet_name];
    if (movement.opposite_wallet_name) {
      if (movement.wallet_id !== movement.opposite_wallet_id) {
        if (movement.resource_type === "goal_transfers_in") {
          walletInfo = `Dompet: ${movement.opposite_wallet_name} → ${movement.wallet_name}`;
        } else if (movement.resource_type === "goal_transfers_out") {
          walletInfo = `Dompet: ${movement.wallet_name} → ${movement.opposite_wallet_name}`;
        }
        walletHighlights = [movement.wallet_name, movement.opposite_wallet_name];
      }
    }
    lines.push({ text: walletInfo, highlightedParts: walletHighlights });

    let goalInfo = `Goal: ${movement.goal_name}`;
    let goalHighlights = [movement.goal_name];
    if (movement.opposite_goal_name) {
      if (movement.goal_id !== movement.opposite_goal_id) {
        if (movement.resource_type === "goal_transfers_in") {
          goalInfo = `Goal: ${movement.opposite_goal_name} → ${movement.goal_name}`;
        } else if (movement.resource_type === "goal_transfers_out") {
          goalInfo = `Goal: ${movement.goal_name} → ${movement.opposite_goal_name}`;
        }
        goalHighlights = [movement.goal_name, movement.opposite_goal_name];
      }
    }
    lines.push({ text: goalInfo, highlightedParts: goalHighlights });

    let instrumentInfo = `Instrumen: ${movement.instrument_name}`;
    let instrumentHighlights = [movement.instrument_name];
    if (movement.opposite_instrument_name) {
      if (movement.instrument_id !== movement.opposite_instrument_id) {
        if (movement.resource_type === "goal_transfers_in") {
          instrumentInfo = `Instrumen: ${movement.opposite_instrument_name} → ${movement.instrument_name}`;
        } else if (movement.resource_type === "goal_transfers_out") {
          instrumentInfo = `Instrumen: ${movement.instrument_name} → ${movement.opposite_instrument_name}`;
        }
        instrumentHighlights = [movement.instrument_name, movement.opposite_instrument_name];
      }
    }
    lines.push({ text: instrumentInfo, highlightedParts: instrumentHighlights });

    let assetInfo = null;
    let assetHighlights: string[] = [];
    if (!movement.asset_name && movement.opposite_asset_name) {
      const direction = movement.resource_type === "goal_transfers_in" ? "Dari" : "Ke";
      assetInfo = `${direction} Aset: ${movement.opposite_asset_name}`;
      assetHighlights = [movement.opposite_asset_name];
    } else if (movement.asset_name && !movement.opposite_asset_name) {
      assetInfo = `Aset: ${movement.asset_name}`;
      assetHighlights = [movement.asset_name];
    } else if (movement.asset_name && movement.opposite_asset_name) {
      if (movement.asset_id !== movement.opposite_asset_id) {
        if (movement.resource_type === "goal_transfers_in") {
          assetInfo = `Aset: ${movement.opposite_asset_name} → ${movement.asset_name}`;
        } else if (movement.resource_type === "goal_transfers_out") {
          assetInfo = `Aset: ${movement.asset_name} → ${movement.opposite_asset_name}`;
        }
        assetHighlights = [movement.asset_name, movement.opposite_asset_name];
      }
    }
    if (assetInfo) {
      lines.push({ text: assetInfo, highlightedParts: assetHighlights });
    }

    return lines;
  }

  const renderDescriptionLine = (line: { text: string; highlightedParts?: string[] }, index: number) => {
    if (!line.highlightedParts || line.highlightedParts.length === 0) {
      return <p key={index}>{line.text}</p>;
    }

    let parts = [line.text];
    line.highlightedParts.forEach(highlight => {
      if (highlight) {
        parts = parts.flatMap(part => 
          part.split(highlight).flatMap((subPart, i, arr) => 
            i < arr.length - 1 ? [subPart, highlight] : [subPart]
          )
        );
      }
    });

    return (
      <p key={index}>
        {parts.map((part, i) => 
          line.highlightedParts?.includes(part) ? (
            <span key={i} className="font-semibold">{part}</span>
          ) : (
            part
          )
        )}
      </p>
    );
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

  // Define column filters for the data table, starting with resource_type
  let columnFilters: ColumnFilter[] = [
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
            <div className="text-sm text-muted-foreground">
              {getDescription(movement).map((line, index) => 
                renderDescriptionLine(line, index)
              )}
            </div>
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
