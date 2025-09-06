import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRightLeft, Edit, Trash2 } from "lucide-react";
import { useDeleteTransfer } from "@/hooks/queries/use-transfers";
import { useTransfersPaginated } from "@/hooks/queries/paginated/use-transfers-paginated";
import ProtectedRoute from "@/components/ProtectedRoute";
import TransferDialog from "@/components/transfers/TransferDialog";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmationModal from "@/components/ConfirmationModal";
import { TransferModel } from "@/models/transfer";
import { formatAmountCurrency } from "@/lib/currency";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { AmountText } from "@/components/ui/amount-text";
import { useCurrencies } from "@/hooks/queries/use-currencies";
import { useWallets } from "@/hooks/queries/use-wallets";

const Transfer = () => {

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transferToDelete, setTransferToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferModel | undefined>(undefined);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [serverSearch, setServerSearch] = useState("");
  const [serverFilters, setServerFilters] = useState<Record<string, any>>({});
  const { data: paged, isLoading } = useTransfersPaginated({ page, itemsPerPage, searchTerm: serverSearch, filters: serverFilters });
  const transfers = paged?.data || [];
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
    setTimeout(() => setIsDialogOpen(true), 50)
  };

  const handleDeleteClick = (transactionId: number) => {
    setTransferToDelete(transactionId);
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
      className="bg-white border-2 sm:border border-gray-100 sm:border-gray-200 rounded-2xl sm:rounded-xl p-5 sm:p-4 shadow-sm hover:shadow-lg sm:hover:shadow-md hover:border-gray-200 transition-all duration-200 sm:duration-75"
    >
      {/* Responsive layout */}
      <div className="space-y-4 sm:space-y-3">
        {/* Header with icon and transfer info */}
        <div className="flex items-start gap-4 sm:gap-3">
          <div className="flex-shrink-0 p-3 sm:p-2 rounded-2xl sm:rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 sm:bg-blue-50 shadow-sm sm:shadow-none">
            <ArrowRightLeft className="w-6 h-6 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg sm:font-semibold sm:text-base text-gray-900 mb-1 sm:mb-0.5">
              Transfer Antar Dompet
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-1 text-sm sm:text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium sm:font-normal">
                  {transfer.from_wallet?.name || `Dompet ${transfer.from_wallet_id}`}
                </span>
                <ArrowRightLeft className="w-4 h-4 sm:w-3 sm:h-3 text-gray-400 flex-shrink-0" />
                <span className="truncate font-medium sm:font-normal">
                  {transfer.to_wallet?.name || `Dompet ${transfer.to_wallet_id}`}
                </span>
              </div>
              <span className="text-xs text-gray-400 sm:hidden">•</span>
              <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(transfer.date)}</span>
            </div>
          </div>
        </div>

        {/* Responsive Amount display */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 sm:bg-gray-50 rounded-2xl sm:rounded-lg p-4 sm:p-3 border border-gray-200 sm:border-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 sm:gap-2">
            <div className="flex items-center justify-between sm:justify-center sm:gap-2">
              <div className="text-center flex-1 sm:flex-initial">
                <div className="text-sm font-semibold text-gray-600 mb-2 sm:mb-1 sm:text-xs">Dari</div>
                <div className="bg-white rounded-xl sm:rounded-lg p-3 sm:p-2 border border-red-200 sm:border-red-100 shadow-sm sm:shadow-none">
                  <AmountText amount={-transfer.from_amount} showSign={true} className="text-red-600 font-bold text-lg sm:text-sm">
                    {formatAmountCurrency(transfer.from_amount, transfer.from_wallet?.currency?.symbol || transfer.from_wallet?.currency_code)}
                  </AmountText>
                </div>
              </div>

              <div className="flex-shrink-0 mx-4 sm:mx-2">
                <div className="p-2 sm:p-1 rounded-full bg-white sm:bg-transparent shadow-sm sm:shadow-none border border-gray-200 sm:border-transparent">
                  <ArrowRightLeft className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 sm:text-gray-400" />
                </div>
              </div>

              <div className="text-center flex-1 sm:flex-initial">
                <div className="text-sm font-semibold text-gray-600 mb-2 sm:mb-1 sm:text-xs">Ke</div>
                <div className="bg-white rounded-xl sm:rounded-lg p-3 sm:p-2 border border-green-200 sm:border-green-100 shadow-sm sm:shadow-none">
                  <AmountText amount={transfer.to_amount} showSign={true} className="text-green-600 font-bold text-lg sm:text-sm">
                    {formatAmountCurrency(transfer.to_amount, transfer.to_wallet?.currency?.symbol || transfer.to_wallet?.currency_code)}
                  </AmountText>
                </div>
              </div>
            </div>

            <div className="text-center sm:hidden">
              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                {transfer.from_wallet?.currency_code} → {transfer.to_wallet?.currency_code}
              </span>
            </div>
          </div>
          <div className="text-center text-xs text-gray-500 mt-2 hidden sm:block">
            {transfer.from_wallet?.currency_code} → {transfer.to_wallet?.currency_code}
          </div>
        </div>

        {/* Responsive Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-4 sm:pt-2 border-t-2 sm:border-t border-gray-100">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 sm:flex-none h-12 sm:h-auto sm:size-sm rounded-xl sm:rounded-md border-2 sm:border text-base sm:text-sm font-medium sm:font-normal hover:bg-gray-50 hover:border-gray-300 transition-all"
            onClick={() => openDialog(transfer)}
          >
            <Edit className="w-5 h-5 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="flex-1 sm:flex-none h-12 sm:h-auto sm:size-sm rounded-xl sm:rounded-md text-base sm:text-sm font-medium sm:font-normal hover:bg-red-600 transition-all"
            onClick={() => handleDeleteClick(transfer.id)}
          >
            <Trash2 className="w-5 h-5 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
            Hapus
          </Button>
        </div>
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
      field: "from_wallet.currency_code",
      label: "Mata Uang Asal",
      type: "select",
      options: currencies?.map(currency => ({
        label: `${currency.code} (${currency.symbol})`,
        value: currency.code
      })) || []
    },
    {
      field: "to_wallet.currency_code",
      label: "Mata Uang Tujuan",
      type: "select",
      options: currencies?.map(currency => ({
        label: `${currency.code} (${currency.symbol})`,
        value: currency.code
      })) || []
    },
    {
      field: "from_amount",
      label: "Jumlah Asal Min",
      type: "number"
    },
    {
      field: "date",
      label: "Tanggal",
      type: "daterange"
    }
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
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

          <DataTable
            data={transfers}
            isLoading={isLoading}
            searchPlaceholder="Cari transfer..."
            searchFields={['from_amount', 'to_amount'] as (keyof TransferModel)[]}
            columnFilters={columnFilters}
            itemsPerPage={itemsPerPage}
            serverMode
            totalCount={paged?.count}
            page={page}
            onServerParamsChange={({ searchTerm, filters, page: nextPage }) => {
              setServerSearch(searchTerm);
              setServerFilters(filters);
              setPage(nextPage);
            }}
            renderItem={renderTransferItem}
            emptyStateMessage="Belum ada transfer"
            title="Manajemen Transfer"
            description="Kelola transfer antar dompet"
            headerActions={
              transfers && transfers.length > 0 && (
                <Button onClick={() => openDialog(undefined)} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Transfer Baru
                </Button>
              )
            }
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Transfer;