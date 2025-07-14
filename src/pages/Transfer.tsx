import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowRightLeft, Edit, Trash2 } from "lucide-react";
import { useTransfers, useDeleteTransfer } from "@/hooks/queries/use-transfers";
import { useWallets, useCurrencies } from "@/hooks/queries";
import ProtectedRoute from "@/components/ProtectedRoute";
import TransferDialog from "@/components/transfers/TransferDialog";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransferModel } from "@/models/transfer";
import { formatAmount } from "@/lib/utils";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";

const Transfer = () => {
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transferToDelete, setTransferToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferModel | undefined>(undefined);
  const { data: transfers, isLoading } = useTransfers();
  const { data: wallets } = useWallets();
  const { data: currencies } = useCurrencies();
  const { mutate: deleteTransfer } = useDeleteTransfer();
  const queryClient = useQueryClient();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const openDialog = (transfer: TransferModel | undefined) => {
    setSelectedTransfer(transfer);
    setActiveDropdownId(null);
    setTimeout(() => setIsDialogOpen(true), 50)
  };

  const handleDeleteClick = (transactionId: number) => {
    setTransferToDelete(transactionId);
    setActiveDropdownId(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transferToDelete) {
      deleteTransfer(transferToDelete);
    }
  };

  const renderTransferItem = (transfer: TransferModel) => (
    <div
      key={transfer.id}
      className="flex items-center justify-between p-4 border rounded-lg"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <ArrowRightLeft className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium">
            {transfer.from_wallet?.name || `Dompet ${transfer.from_wallet_id}`} → {transfer.to_wallet?.name || `Dompet ${transfer.to_wallet_id}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDate(transfer.date)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-red-600">
                -{formatAmount(transfer.amount_from, transfer.from_currency?.symbol || transfer.currency_from)}
              </Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="outline" className="text-green-600">
                +{formatAmount(transfer.amount_to, transfer.to_currency?.symbol || transfer.currency_to)}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {transfer.currency_from} → {transfer.currency_to}
            </div>
          </div>
        </div>
        <DropdownMenu
          open={activeDropdownId === transfer.id}
          onOpenChange={(open) =>
            setActiveDropdownId(open ? transfer.id : null)
          }
        >
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              •••
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => openDialog(transfer)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDeleteClick(transfer.id)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const columnFilters: ColumnFilter[] = [
    {
      field: "from_wallet_id",
      label: "Dari Dompet",
      type: "select",
      options: wallets?.map(wallet => ({
        label: wallet.name,
        value: wallet.id.toString()
      })) || []
    },
    {
      field: "to_wallet_id",
      label: "Ke Dompet",
      type: "select",
      options: wallets?.map(wallet => ({
        label: wallet.name,
        value: wallet.id.toString()
      })) || []
    },
    {
      field: "currency_from",
      label: "Mata Uang Asal",
      type: "select",
      options: currencies?.map(currency => ({
        label: `${currency.code} (${currency.symbol})`,
        value: currency.code
      })) || []
    },
    {
      field: "currency_to",
      label: "Mata Uang Tujuan",
      type: "select",
      options: currencies?.map(currency => ({
        label: `${currency.code} (${currency.symbol})`,
        value: currency.code
      })) || []
    },
    {
      field: "amount_from",
      label: "Jumlah Asal Min",
      type: "number"
    },
    {
      field: "date",
      label: "Tanggal",
      type: "date"
    }
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Transfer</h1>
              <p className="text-muted-foreground">Kelola transfer antar dompet</p>
            </div>
            <Button onClick={() => openDialog(undefined)}>
              <Plus className="w-4 h-4 mr-2" />
              Transfer Baru
            </Button>

            <TransferDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              transfer={selectedTransfer}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["transfers"] });
              }}
            />

            <ConfirmationModal
              open={isDeleteModalOpen}
              onOpenChange={setIsDeleteModalOpen}
              onConfirm={handleConfirmDelete}
              title="Hapus Transfer"
              description="Apakah Anda yakin ingin menghapus transfer ini? Tindakan ini tidak dapat dibatalkan."
              confirmText="Ya, Hapus"
              cancelText="Batal"
              variant="destructive"
            />
          </div>

          <DataTable
            data={transfers || []}
            isLoading={isLoading}
            searchPlaceholder="Cari transfer..."
            searchFields={["amount_from", "amount_to"]}
            columnFilters={columnFilters}
            renderItem={renderTransferItem}
            emptyStateMessage="Belum ada transfer"
            title="Riwayat Transfer"
            description="Daftar semua transfer yang telah dilakukan"
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ["transfers"] })}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Transfer;