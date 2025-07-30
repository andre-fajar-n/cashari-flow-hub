import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Edit, Plus, RotateCcw, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import { useDebtHistories } from "@/hooks/queries/use-debt-histories";
import { useDebts, useMarkDebtAsActive, useMarkDebtAsPaid } from "@/hooks/queries";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DebtHistoryDialog from "@/components/debt/DebtHistoryDialog";
import { formatAmountCurrency } from "@/lib/currency";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useDeleteDebtHistory } from "@/hooks/queries/use-debt-histories";
import { AmountText } from "@/components/ui/amount-text";

const DebtHistory = () => {
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
  const [isMarkActiveModalOpen, setIsMarkActiveModalOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState<any>(null);
  const [historyToEdit, setHistoryToEdit] = useState<any>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const debtId = id ? parseInt(id) : 0;
  const { data: histories, isLoading } = useDebtHistories(debtId);
  const { data: debts } = useDebts();
  const markAsPaid = useMarkDebtAsPaid();
  const markAsActive = useMarkDebtAsActive();
  const deleteDebtHistory = useDeleteDebtHistory();
  const debt = debts?.find(d => d.id === debtId);

  const handleMarkAsPaid = () => {
    markAsPaid.mutate(debt.id);
  };

  const handleMarkAsActive = () => {
    markAsActive.mutate(debt.id);
  };

  const handleEdit = (history: any) => {
    setIsHistoryDialogOpen(true);
    setHistoryToEdit(history);
  };

  const handleDeleteClick = (history: any) => {
    setHistoryToDelete(history);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (historyToDelete) {
      deleteDebtHistory.mutate(historyToDelete.id);
    }
  };

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <AmountText
                amount={history.categories?.is_income ? history.amount : -history.amount}
                className="font-semibold text-lg"
                showSign={!history.categories?.is_income}
              >
                {formatAmountCurrency(Math.abs(history.amount), history.currency_code)}
              </AmountText>
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
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEdit(debt)}
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDeleteClick(debt)}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Hapus
            </Button>
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

  const totalAmount = histories?.reduce((sum, history) => sum + (history.categories?.is_income ? history.amount : -history.amount), 0) || 0;

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
                    Total: {formatAmountCurrency(Math.abs(totalAmount))} {histories[0]?.currency_code}
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
              debt.status === 'active' ? (
                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => setIsMarkPaidModalOpen(true)}
                    variant="outline"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Tandai Lunas
                  </Button>
                  <Button onClick={() => setIsHistoryDialogOpen(true)} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah History
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsMarkActiveModalOpen(true)}
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Tandai Aktif
                </Button>
              )
            }
          />
        </div>

        <DebtHistoryDialog
          open={isHistoryDialogOpen}
          onOpenChange={setIsHistoryDialogOpen}
          debtId={debtId}
          history={historyToEdit}
          onSuccess={() => {
            // Data akan di-refresh otomatis oleh react-query
          }}
        />

        <ConfirmationModal
          open={isMarkPaidModalOpen}
          onOpenChange={setIsMarkPaidModalOpen}
          onConfirm={handleMarkAsPaid}
          title="Tandai Sebagai Lunas"
          description="Apakah Anda yakin ingin menandai hutang/piutang ini sebagai lunas?"
          confirmText="Ya, Tandai Lunas"
          cancelText="Batal"
        />

        <ConfirmationModal
          open={isMarkActiveModalOpen}
          onOpenChange={setIsMarkActiveModalOpen}
          onConfirm={handleMarkAsActive}
          title="Tandai Sebagai Aktif"
          description="Apakah Anda yakin ingin menandai hutang/piutang ini sebagai aktif?"
          confirmText="Ya, Tandai Aktif"
          cancelText="Batal"
        />

        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          title="Hapus History Pembayaran"
          description="Apakah Anda yakin ingin menghapus history pembayaran ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Ya, Hapus"
          cancelText="Batal"
          variant="destructive"
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default DebtHistory;
