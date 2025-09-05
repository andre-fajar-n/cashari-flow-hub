import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpCircle, ArrowDownCircle, Edit, Trash2 } from "lucide-react";
import { useTransactions, useDeleteTransaction } from "@/hooks/queries/use-transactions";
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

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
      className="flex items-center justify-between p-4 border rounded-lg"
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="flex-shrink-0">
          {transaction.categories?.is_income ? (
            <ArrowUpCircle className="w-5 h-5 text-green-600" />
          ) : (
            <ArrowDownCircle className="w-5 h-5 text-red-600" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium">{transaction.categories?.name}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{transaction.wallets?.name}</span>
            <span>•</span>
            <span>{formatDate(transaction.date)}</span>
          </div>
          {transaction.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {transaction.description}
            </p>
          )}
          <TransactionAssociations transaction={transaction} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="flex items-center gap-2">
            <AmountText
              amount={transaction.categories?.is_income ? transaction.amount : -transaction.amount}
              className="font-semibold"
              showSign={true}
            >
              {formatAmountCurrency(transaction.amount, transaction.wallets.currency_code)}
            </AmountText>
          </div>
          <Badge variant="outline" className="mt-1">
            {transaction.wallets.currency_code}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDialog(transaction)}
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteClick(transaction.id)}
          >
            <Trash2 className="w-3 h-3 mr-1" />
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
