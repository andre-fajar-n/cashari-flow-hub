
import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useTransactions } from "@/hooks/queries/useTransactions";
import TransactionForm from "@/components/transactions/TransactionForm";
import ProtectedRoute from "@/components/ProtectedRoute";

const Transaction = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: transactions, isLoading } = useTransactions();

  const formatAmount = (amount: number, symbol: string) => {
    return `${symbol} ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Transaksi
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Tambah Transaksi Baru</DialogTitle>
                </DialogHeader>
                <TransactionForm onSuccess={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

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
              ) : transactions?.length === 0 ? (
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
                      <div className="text-right">
                        <p className={`font-semibold ${(transaction.categories as any)?.is_income ? 'text-green-600' : 'text-red-600'}`}>
                          {(transaction.categories as any)?.is_income ? '+' : '-'}
                          {formatAmount(transaction.amount, (transaction.currencies as any)?.symbol)}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {transaction.currency_code}
                        </Badge>
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
