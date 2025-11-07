import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, Edit, Plus, RotateCcw, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import { useDebtHistories } from "@/hooks/queries/use-debt-histories";
import { useDebtDetail, useMarkDebtAsActive, useMarkDebtAsPaid } from "@/hooks/queries/use-debts";
import { useDebtSummaryById } from "@/hooks/queries/use-debt-summary";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DebtHistoryDialog from "@/components/debt/DebtHistoryDialog";
import DebtSummaryCard from "@/components/debt/DebtSummaryCard";
import { formatAmountCurrency } from "@/lib/currency";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useDeleteDebtHistory } from "@/hooks/queries/use-debt-histories";
import { AmountText } from "@/components/ui/amount-text";
import { DebtHistoryModel } from "@/models/debt-histories";
import { formatDate } from "@/lib/date";

const DebtHistory = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
  const [isMarkActiveModalOpen, setIsMarkActiveModalOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState<DebtHistoryModel | null>(null);
  const [historyToEdit, setHistoryToEdit] = useState<DebtHistoryModel | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const debtId = id ? parseInt(id) : 0;
  const { data: histories, isLoading } = useDebtHistories({ debtId });
  const { data: debtSummary } = useDebtSummaryById(debtId);
  const markAsPaid = useMarkDebtAsPaid();
  const markAsActive = useMarkDebtAsActive();
  const deleteDebtHistory = useDeleteDebtHistory();
  const { data: debt } = useDebtDetail(debtId);

  const handleMarkAsPaid = () => {
    markAsPaid.mutate(debt.id);
  };

  const handleMarkAsActive = () => {
    markAsActive.mutate(debt.id);
  };

  const handleEdit = (history: DebtHistoryModel) => {
    setIsHistoryDialogOpen(true);
    setHistoryToEdit(history);
  };

  const handleDeleteClick = (history: DebtHistoryModel) => {
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

  const renderHistoryItem = (history: DebtHistoryModel) => (
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
                {formatAmountCurrency(Math.abs(history.amount), history.wallets?.currency_code)}
              </AmountText>
              <Badge variant="outline">
                {formatDate(history.date)}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Dompet: {history.wallets?.name}</div>
              <div>Kategori: {history.categories?.name}</div>
              {history.description && (
                <div>Deskripsi: {history.description}</div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEdit(history)}
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteClick(history)}
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
      field: "wallet_id",
      label: "Dompet",
      type: "select",
      options: Array.from(
        new Map(
          histories?.map((h) => [h.wallet_id, {
            label: h.wallets?.name,
            value: h.wallet_id.toString()
          }]) || []
        ).values()
      )
    },
    {
      field: "date",
      label: "Tanggal",
      type: "daterange"
    },
  ];

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
                <p className="text-muted-foreground">Detail Hutang/Piutang</p>
              </div>
            </div>

            {/* Action Buttons - Always visible above tabs */}
            <div className="flex gap-2 justify-end">
              {debt.status === 'active' ? (
                <>
                  <Button
                    onClick={() => setIsMarkPaidModalOpen(true)}
                    variant="outline"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Tandai Lunas
                  </Button>
                  <Button onClick={() => setIsHistoryDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah History
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsMarkActiveModalOpen(true)}
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Tandai Aktif
                </Button>
              )}
            </div>
          </div>


          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Ringkasan</TabsTrigger>
              <TabsTrigger value="history">Riwayat</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              {debtSummary && (
                <DebtSummaryCard
                  summaryData={debtSummary}
                  showDetailedBreakdown={true}
                  title={`Ringkasan ${debt.name}`}
                />
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <DataTable
                data={histories || []}
                isLoading={isLoading}
                searchPlaceholder="Cari history pembayaran..."
                searchFields={["description", "categories.name"]}
                columnFilters={columnFilters}
                renderItem={renderHistoryItem}
                emptyStateMessage="Belum ada history pembayaran"
                title="History Pembayaran"
                description={`Daftar pembayaran untuk ${debt.name}`}
              />
            </TabsContent>
          </Tabs>
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
