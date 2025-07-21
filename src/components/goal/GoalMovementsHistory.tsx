
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionDropdown } from "@/components/ui/action-dropdown";
import { ArrowUpRight, ArrowDownLeft, Calendar, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { formatAmountCurrency } from "@/lib/utils";
import { Database } from "@/integrations/supabase/types";
import { AmountText } from "@/components/ui/amount-text";
import { useDeleteGoalInvestmentRecord, useDeleteGoalTransfer } from "@/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ConfirmationModal from "@/components/ConfirmationModal";

interface GoalMovementsHistoryProps {
  movements: Database["public"]["Views"]["money_movements"]["Row"][];
  transfers: Database["public"]["Tables"]["goal_transfers"]["Row"][];
  goalId: number;
}

const GoalMovementsHistory = ({ movements, transfers, goalId }: GoalMovementsHistoryProps) => {
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    type: 'transfer' | 'record' | null;
    id: number | null;
  }>({ open: false, type: null, id: null });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: deleteRecord } = useDeleteGoalInvestmentRecord();
  const { mutate: deleteTransfer } = useDeleteGoalTransfer();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

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

        // Handle wallet transfers (check for same wallet)
        if (transfer.from_wallet_id && transfer.to_wallet_id) {
          if (transfer.from_wallet_id === transfer.to_wallet_id) {
            lines.push(`Wallet: ${transfer.from_wallet?.name || 'Unknown'}`);
          } else {
            lines.push(`${transfer.from_wallet?.name || 'Unknown'} → ${transfer.to_wallet?.name || 'Unknown'}`);
          }
        } else if (transfer.from_wallet_id) {
          lines.push(`Dari Wallet: ${transfer.from_wallet?.name || 'Unknown'}`);
        } else if (transfer.to_wallet_id) {
          lines.push(`Ke Wallet: ${transfer.to_wallet?.name || 'Unknown'}`);
        }

        // Handle goal transfers (check for same goal)
        if (transfer.from_goal_id && transfer.to_goal_id) {
          if (transfer.from_goal_id === transfer.to_goal_id) {
            lines.push(`Goal: ${transfer.from_goal?.name || 'Unknown'}`);
          } else {
            lines.push(`${transfer.from_goal?.name || 'Unknown'} → ${transfer.to_goal?.name || 'Unknown'}`);
          }
        } else if (transfer.from_goal_id) {
          lines.push(`Dari Goal: ${transfer.from_goal?.name || 'Unknown'}`);
        } else if (transfer.to_goal_id) {
          lines.push(`Ke Goal: ${transfer.to_goal?.name || 'Unknown'}`);
        }

        // Handle instrument transfers (check for same instrument)
        if (transfer.from_instrument_id && transfer.to_instrument_id) {
          if (transfer.from_instrument_id === transfer.to_instrument_id) {
            lines.push(`Instrumen: ${transfer.from_instrument?.name || 'Unknown'}`);
          } else {
            lines.push(`${transfer.from_instrument?.name || 'Unknown'} → ${transfer.to_instrument?.name || 'Unknown'}`);
          }
        } else if (transfer.from_instrument_id) {
          lines.push(`Dari Instrumen: ${transfer.from_instrument?.name || 'Unknown'}`);
        } else if (transfer.to_instrument_id) {
          lines.push(`Ke Instrumen: ${transfer.to_instrument?.name || 'Unknown'}`);
        }

        // Handle asset transfers (check for same asset)
        if (transfer.from_asset_id && transfer.to_asset_id) {
          if (transfer.from_asset_id === transfer.to_asset_id) {
            lines.push(`Aset: ${transfer.from_asset?.name || 'Unknown'}${transfer.from_asset?.symbol ? ` (${transfer.from_asset?.symbol})` : ''}`);
          } else {
            lines.push(`${transfer.from_asset?.name || 'Unknown'}${transfer.from_asset?.symbol ? ` (${transfer.from_asset?.symbol})` : ''} → ${transfer.to_asset?.name || 'Unknown'}${transfer.to_asset?.symbol ? ` (${transfer.to_asset?.symbol})` : ''}`);
          }
        } else if (transfer.from_asset_id) {
          lines.push(`Dari Aset: ${transfer.from_asset?.name || 'Unknown'}${transfer.from_asset?.symbol ? ` (${transfer.from_asset?.symbol})` : ''}`);
        } else if (transfer.to_asset_id) {
          lines.push(`Ke Aset: ${transfer.to_asset?.name || 'Unknown'}${transfer.to_asset?.symbol ? ` (${transfer.to_asset?.symbol})` : ''}`);
        }

        return lines;
      }
    }

    // Fallback to original description
    return [movement.description || 'Money movement'];
  };

  const handleEdit = (movement: any) => {
    // TODO: Implement edit functionality
    toast({
      title: "Info",
      description: "Fitur edit akan segera hadir",
    });
  };

  const handleDelete = (movement: any) => {
    let type: 'transfer' | 'record' | null = null;
    
    if (movement.resource_type === 'goal_transfers_in' || movement.resource_type === 'goal_transfers_out') {
      type = 'transfer';
    } else if (movement.resource_type === 'investment_growth') {
      type = 'record';
    }

    if (type && movement.resource_id) {
      setDeleteModal({ open: true, type, id: movement.resource_id });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteModal.type === 'transfer' && deleteModal.id) {
      deleteTransfer(deleteModal.id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["goal_transfers"] });
          queryClient.invalidateQueries({ queryKey: ["goal_movements"] });
          queryClient.invalidateQueries({ queryKey: ["goals"] });
          setDeleteModal({ open: false, type: null, id: null });
          toast({
            title: "Berhasil",
            description: "Transfer berhasil dihapus",
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      });
    } else if (deleteModal.type === 'record' && deleteModal.id) {
      deleteRecord(deleteModal.id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["goal_investment_records"] });
          queryClient.invalidateQueries({ queryKey: ["goal_movements"] });
          queryClient.invalidateQueries({ queryKey: ["goals"] });
          setDeleteModal({ open: false, type: null, id: null });
          toast({
            title: "Berhasil",
            description: "Record berhasil dihapus",
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Riwayat Pergerakan Dana
          </CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Belum ada riwayat pergerakan dana</p>
            </div>
          ) : (
            <div className="space-y-4">
              {movements.map((movement, index) => (
                <div
                  key={`${movement.resource_type}-${movement.resource_id}-${index}`}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {movement.amount && movement.amount > 0 ? (
                        <ArrowDownLeft className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {movement.amount && movement.amount > 0 ? 'Dana Masuk' : 'Dana Keluar'}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {movement.resource_type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {getTransferDescription(movement).map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
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
                        {formatAmountCurrency(Math.abs(movement.amount || 0), movement.currency_code || 'IDR')}
                      </AmountText>
                      {movement.amount_unit && (
                        <p className="text-sm text-muted-foreground">
                          {movement.amount_unit.toLocaleString("id-ID")} {movement.unit_label || 'unit'}
                        </p>
                      )}
                    </div>
                    <ActionDropdown
                      dropdownId={index}
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmationModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        onConfirm={handleConfirmDelete}
        title="Hapus Item"
        description={`Apakah Anda yakin ingin menghapus ${deleteModal.type === 'transfer' ? 'transfer' : 'record'} ini? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="destructive"
      />
    </>
  );
};

export default GoalMovementsHistory;
