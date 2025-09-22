import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpCircle, ArrowDownCircle, Edit, Trash2 } from "lucide-react";
import { useDeleteTransaction } from "@/hooks/queries/use-transactions";
import { useTransactionsPaginated } from "@/hooks/queries/paginated/use-transactions-paginated";
import { useCategories } from "@/hooks/queries/use-categories";
import { useWallets } from "@/hooks/queries/use-wallets";
import TransactionDialog from "@/components/transactions/TransactionDialog";
import TransactionAssociations from "@/components/transactions/TransactionAssociations";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useQueryClient } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import { formatAmountCurrency } from "@/lib/currency";
import { TransactionFormData } from "@/form-dto/transactions";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { AmountText } from "@/components/ui/amount-text";
import { TransactionModel } from "@/models/transactions";
import { formatDate } from "@/lib/date";

const Transaction = () => {

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionFormData | undefined>(undefined);
  // Server-side pagination state
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [serverSearch, setServerSearch] = useState("");
  const [serverFilters, setServerFilters] = useState<Record<string, any>>({});
  const { data: paged, isLoading } = useTransactionsPaginated({ page, itemsPerPage, searchTerm: serverSearch, filters: serverFilters });
  const transactions = paged?.data || [];
  const { data: categories } = useCategories();
  const { data: wallets } = useWallets();
  const { mutate: deleteTransaction } = useDeleteTransaction();

  const openDialog = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (transactionId: number) => {
    setTransactionToDelete(transactionId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete);
    }
  };

  const renderTransactionItem = (transaction: TransactionModel) => (
    <div
      key={transaction.id}
      className="bg-white border-2 sm:border border-gray-100 sm:border-gray-200 rounded-2xl sm:rounded-xl p-5 sm:p-4 shadow-sm hover:shadow-lg sm:hover:shadow-md hover:border-gray-200 transition-all duration-200 sm:duration-75"
    >
      {/* Responsive layout */}
      <div className="space-y-4 sm:space-y-3">
        {/* Header with icon, category, and amount */}
        <div className="flex items-start justify-between gap-4 sm:gap-3">
          <div className="flex items-start sm:items-center gap-4 sm:gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 p-3 sm:p-2 rounded-2xl sm:rounded-full bg-gradient-to-br from-gray-50 to-gray-100 sm:bg-gray-50 shadow-sm sm:shadow-none">
              {transaction.categories?.is_income ? (
                <ArrowUpCircle className="w-6 h-6 sm:w-5 sm:h-5 text-green-600" />
              ) : (
                <ArrowDownCircle className="w-6 h-6 sm:w-5 sm:h-5 text-red-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg sm:font-semibold sm:text-base text-gray-900 truncate mb-1 sm:mb-0">
                {transaction.categories?.name}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1 text-sm sm:text-xs text-gray-500 mt-1 sm:mt-0.5">
                <span className="truncate font-medium sm:font-normal">{transaction.wallets?.name}</span>
                <span className="hidden sm:inline">•</span>
                <span className="whitespace-nowrap">{formatDate(transaction.date)}</span>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            <AmountText
              amount={transaction.categories?.is_income ? transaction.amount : -transaction.amount}
              className="font-bold text-xl sm:text-lg"
              showSign={true}
            >
              {formatAmountCurrency(transaction.amount, transaction.wallets.currency_code)}
            </AmountText>
          </div>
        </div>

        {/* Description */}
        {transaction.description && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 sm:bg-gray-50 rounded-xl sm:rounded-lg p-4 sm:p-2 border border-blue-100 sm:border-transparent">
            <p className="text-sm text-gray-700 sm:text-gray-600 leading-relaxed sm:leading-normal">
              {transaction.description}
            </p>
          </div>
        )}

        {/* Associations */}
        <TransactionAssociations transaction={transaction} />

        {/* Responsive Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-4 sm:pt-2 border-t-2 sm:border-t border-gray-100">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 sm:flex-none h-12 sm:h-auto sm:size-sm rounded-xl sm:rounded-md border-2 sm:border text-base sm:text-sm font-medium sm:font-normal hover:bg-gray-50 hover:border-gray-300 transition-all"
            onClick={() => openDialog(transaction)}
          >
            <Edit className="w-5 h-5 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="flex-1 sm:flex-none h-12 sm:h-auto sm:size-sm rounded-xl sm:rounded-md text-base sm:text-sm font-medium sm:font-normal hover:bg-red-600 transition-all"
            onClick={() => handleDeleteClick(transaction.id)}
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
      field: "category_id",
      label: "Kategori",
      type: "select",
      options: categories?.map(cat => ({
        label: cat.name,
        value: cat.id.toString()
      })) || []
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
    {
      field: "amount",
      label: "Jumlah Min",
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
          <TransactionDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            transaction={selectedTransaction}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["transactions"] });
              queryClient.invalidateQueries({ queryKey: ["transactions_paginated"] });
            }}
          />

          <ConfirmationModal
            open={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            onConfirm={handleConfirmDelete}
            title="Hapus Transaksi"
            description="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
            confirmText="Ya, Hapus"
            cancelText="Batal"
            variant="destructive"
          />

          <DataTable
            data={transactions}
            isLoading={isLoading}
            searchPlaceholder="Cari transaksi..."
            searchFields={["description", "amount"]}
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
            useUrlParams={true}
            renderItem={renderTransactionItem}
            emptyStateMessage="Belum ada transaksi"
            title="Manajemen Transaksi"
            description="Kelola pemasukan dan pengeluaran Anda"
            headerActions={
              transactions && transactions.length > 0 && (
                <Button onClick={() => openDialog(undefined)} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Transaksi
                </Button>
              )
            }
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Transaction;
