import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpCircle, ArrowDownCircle, Edit, Trash2 } from "lucide-react";
import { useTransactions, useDeleteTransaction } from "@/hooks/queries/use-transactions";
import { useCategories, useWallets } from "@/hooks/queries";
import TransactionDialog from "@/components/transactions/TransactionDialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useQueryClient } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatAmount } from "@/lib/utils";
import { TransactionFormData } from "@/form-dto/transactions";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";

const Transaction = () => {
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionFormData | undefined>(undefined);
  const { data: transactions, isLoading } = useTransactions();
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
    setActiveDropdownId(null);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (transactionId: number) => {
    setTransactionToDelete(transactionId);
    setActiveDropdownId(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete);
    }
  };

  const renderTransactionItem = (transaction: any) => (
    <div
      key={transaction.id}
      className="flex items-center justify-between p-4 border rounded-lg"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {(transaction.categories as any)?.is_income ? (
            <ArrowUpCircle className="w-5 h-5 text-green-600" />
          ) : (
            <ArrowDownCircle className="w-5 h-5 text-red-600" />
          )}
        </div>
        <div>
          <p className="font-medium">{(transaction.categories as any)?.name}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{(transaction.wallets as any)?.name}</span>
            <span>•</span>
            <span>{formatDate(transaction.date)}</span>
          </div>
          {transaction.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {transaction.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className={`font-semibold ${(transaction.categories as any)?.is_income ? 'text-green-600' : 'text-red-600'}`}>
            {(transaction.categories as any)?.is_income ? '+' : '-'}
            {formatAmount(transaction.amount, transaction.currency_code)}
          </p>
          <Badge variant="outline" className="mt-1">
            {transaction.currency_code}
          </Badge>
        </div>
        <DropdownMenu
          open={activeDropdownId === transaction.id}
          onOpenChange={(open) =>
            setActiveDropdownId(open ? transaction.id : null)
          }
        >
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              •••
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => openDialog(transaction)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDeleteClick(transaction.id)}
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Transaksi</h1>
              <p className="text-muted-foreground">Kelola pemasukan dan pengeluaran Anda</p>
            </div>
            <Button onClick={() => openDialog(undefined)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Transaksi
            </Button>
          </div>

          <TransactionDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            transaction={selectedTransaction}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["transactions"] });
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
            data={transactions || []}
            isLoading={isLoading}
            searchPlaceholder="Cari transaksi..."
            searchFields={["description", "amount"]}
            columnFilters={columnFilters}
            renderItem={renderTransactionItem}
            emptyStateMessage="Belum ada transaksi"
            title="Riwayat Transaksi"
            description="Daftar semua transaksi yang telah dilakukan"
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ["transactions"] })}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Transaction;