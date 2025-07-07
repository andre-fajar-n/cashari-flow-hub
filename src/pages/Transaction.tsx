
import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpCircle, ArrowDownCircle, Edit, Trash2 } from "lucide-react";
import { useTransactions, useDeleteTransaction } from "@/hooks/queries/use-transactions";
import TransactionDialog from "@/components/transactions/TransactionDialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useQueryClient } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatAmount } from "@/lib/utils";

interface TransactionFormData {
  amount: number;
  category_id: string;
  wallet_id: string;
  date: string;
  description?: string;
}

const Transaction = () => {
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionFormData | undefined>(undefined);
  const { data: transactions, isLoading } = useTransactions();
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
    setTimeout(() => setIsDialogOpen(true), 50);
  };

  const handleDeleteClick = (transactionId: number) => {
    setTransactionToDelete(transactionId);
    setActiveDropdownId(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete, {
        onSuccess: () => {
          toast({
            title: "Berhasil",
            description: "Transaksi berhasil dihapus",
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    }
  };

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

          <Card>
            <CardHeader>
              <CardTitle>Riwayat Transaksi</CardTitle>
              <CardDescription>
                Daftar semua transaksi yang telah dilakukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Memuat transaksi...</p>
                </div>
              ) : !transactions || transactions?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Belum ada transaksi</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions?.map((transaction) => (
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
                            {formatAmount(transaction.amount, (transaction.currencies as any)?.symbol)}
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Transaction;
