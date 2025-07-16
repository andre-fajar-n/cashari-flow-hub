
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import { useDebtHistories } from "@/hooks/queries/use-debt-histories";
import { useDebts } from "@/hooks/queries";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DebtHistoryDialog from "@/components/debt/DebtHistoryDialog";

const DebtHistory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const debtId = id ? parseInt(id) : 0;
  
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  
  const { data: histories, isLoading } = useDebtHistories(debtId);
  const { data: debts } = useDebts();
  
  const debt = debts?.find(d => d.id === debtId);

  if (!debt) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Hutang/piutang tidak ditemukan</p>
            <Button onClick={() => navigate("/debt")} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Hutang/Piutang
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const renderHistoryItem = (history: any) => (
    <Card key={history.id}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">
                {Number(history.amount).toLocaleString()} {history.currency_code}
              </span>
              <Badge variant="outline">
                {new Date(history.date).toLocaleDateString('id-ID')}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Dompet: {history.wallets?.name}</div>
              <div>Kategori: {history.categories?.name}</div>
              {history.description && (
                <div>Deskripsi: {history.description}</div>
              )}
              {history.exchange_rate && history.exchange_rate !== 1 && (
                <div>Kurs: {history.exchange_rate}</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const columnFilters: ColumnFilter[] = [
    {
      field: "date",
      label: "Tanggal",
      type: "daterange"
    },
    {
      field: "currency_code",
      label: "Mata Uang",
      type: "select",
      options: Array.from(new Set(histories?.map(h => h.currency_code) || [])).map(code => ({
        label: code,
        value: code
      }))
    }
  ];

  const totalAmount = histories?.reduce((sum, history) => sum + Number(history.amount), 0) || 0;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/debt")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{debt.name}</h1>
                <p className="text-muted-foreground">History Pembayaran</p>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          {histories && histories.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    Total: {totalAmount.toLocaleString()} {histories[0]?.currency_code}
                  </div>
                  <p className="text-muted-foreground">
                    Total pembayaran dari {histories.length} transaksi
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Table */}
          <DataTable
            data={histories || []}
            isLoading={isLoading}
            searchPlaceholder="Cari history pembayaran..."
            searchFields={["wallets.name", "categories.name", "description"]}
            columnFilters={columnFilters}
            renderItem={renderHistoryItem}
            emptyStateMessage="Belum ada history pembayaran"
            title="History Pembayaran"
            description={`Daftar pembayaran untuk ${debt.name}`}
            headerActions={
              debt.status === 'active' && (
                <Button onClick={() => setIsHistoryDialogOpen(true)} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah History
                </Button>
              )
            }
          />
        </div>

        <DebtHistoryDialog
          open={isHistoryDialogOpen}
          onOpenChange={setIsHistoryDialogOpen}
          debtId={debtId}
          debtCurrency={debt.currency_code}
          onSuccess={() => {
            // Data akan di-refresh otomatis oleh react-query
          }}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default DebtHistory;
