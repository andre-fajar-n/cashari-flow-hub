import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, Plus, RotateCcw, Calendar, AlertTriangle } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import { useDebtDetail, useMarkDebtAsActive, useMarkDebtAsPaid } from "@/hooks/queries/use-debts";
import { useDebtSummaryById } from "@/hooks/queries/use-debt-summary";
import DebtHistoryDialog from "@/components/debt/DebtHistoryDialog";
import DebtSummaryCard from "@/components/debt/DebtSummaryCard";
import ConfirmationModal from "@/components/ConfirmationModal";
import DebtHistoryList from "@/components/debt/DebtHistoryList";
import { DebtHistoryModel } from "@/models/debt-histories";
import { useDeleteDebtHistory } from "@/hooks/queries/use-debt-histories";
import { MoneyMovementModel } from "@/models/money-movements";
import { useCurrencyDetail } from "@/hooks/queries/use-currencies";
import { formatAmountCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { AmountText } from "@/components/ui/amount-text";
import { Badge } from "@/components/ui/badge";
import { calculateTotalInBaseCurrency, calculateDebtProgress } from "@/lib/debt-summary";
import { useUserSettings } from "@/hooks/queries/use-user-settings";

const DebtHistory = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
  const [isMarkActiveModalOpen, setIsMarkActiveModalOpen] = useState(false);

  // Unified dialog state for both add and edit
  const [debtHistoryDialog, setDebtHistoryDialog] = useState<{
    open: boolean;
    history?: DebtHistoryModel;
  }>({ open: false });

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    item?: MoneyMovementModel;
  }>({ open: false });

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const debtId = id ? parseInt(id) : 0;
  const { data: debtSummary } = useDebtSummaryById(debtId);
  const markAsPaid = useMarkDebtAsPaid();
  const markAsActive = useMarkDebtAsActive();
  const { data: debt } = useDebtDetail(debtId);
  const { mutateAsync: deleteDebtHistory } = useDeleteDebtHistory();
  const { data: userSettings } = useUserSettings();

  // Calculate totals and progress
  const totalCalculation = useMemo(() => {
    if (!debtSummary || debtSummary.length === 0) {
      return {
        total_income: 0,
        total_outcome: 0,
        total_net: 0,
        can_calculate: true,
        base_currency_code: userSettings?.base_currency_code || null,
        base_currency_symbol: userSettings?.currencies?.symbol || null
      };
    }
    return calculateTotalInBaseCurrency(debtSummary);
  }, [debtSummary, userSettings]);

  const progressCalculation = useMemo(() => {
    if (!debt || !totalCalculation.can_calculate) {
      return null;
    }
    return calculateDebtProgress(
      totalCalculation.total_income || 0,
      totalCalculation.total_outcome || 0,
      debt.type
    );
  }, [debt, totalCalculation]);

  // Labels based on debt type
  const labels = useMemo(() => {
    if (!debt) return { initial: '', paid: '', remaining: '' };

    if (debt.type === 'loan') {
      return {
        initial: 'Total Hutang',
        paid: 'Terbayar',
        remaining: 'Sisa Hutang'
      };
    } else {
      return {
        initial: 'Total Piutang',
        paid: 'Diterima',
        remaining: 'Sisa Piutang'
      };
    }
  }, [debt]);

  const handleMarkAsPaid = () => {
    markAsPaid.mutate(debt.id);
  };

  const handleMarkAsActive = () => {
    markAsActive.mutate(debt.id);
  };

  // Handler to open dialog for adding new history
  const handleAddHistory = () => {
    setDebtHistoryDialog({ open: true });
  };

  // Handler to open dialog for editing existing history
  const handleEditHistory = (history: DebtHistoryModel) => {
    setDebtHistoryDialog({ open: true, history });
  };

  // Handler to open delete confirmation modal
  const handleDeleteHistory = (item: MoneyMovementModel) => {
    setDeleteModal({ open: true, item });
  };

  // Handler to confirm delete
  const handleConfirmDelete = () => {
    if (deleteModal.item) {
      deleteDebtHistory(deleteModal.item.resource_id);
    }
    setDeleteModal({ open: false });
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

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate("/debt")}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{debt.name}</h1>
                    <Badge variant={debt.status === 'active' ? 'default' : 'secondary'}>
                      {debt.status === 'active' ? 'Aktif' : 'Lunas'}
                    </Badge>
                    <Badge variant="outline">
                      {debt.type === 'loan' ? 'Hutang' : 'Piutang'}
                    </Badge>
                  </div>
                  {debt.due_date && (
                    <p className="text-muted-foreground mt-0.5 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Jatuh Tempo: {formatDate(debt.due_date)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pr-1">
                {debt.status === 'active' ? (
                  <>
                    <Button onClick={handleAddHistory}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah History
                    </Button>
                    <Button
                      onClick={() => setIsMarkPaidModalOpen(true)}
                      variant="outline"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Tandai Lunas
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

            {/* Compact stats */}
            {debtSummary && debtSummary.length > 0 && progressCalculation && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-2 px-2 border-t">
                <div className="sm:text-center">
                  <p className="text-xs text-muted-foreground">{labels.initial}</p>
                  <p className="font-semibold">{formatAmountCurrency(progressCalculation.totalInitial, userSettings?.base_currency_code, userSettings?.currencies?.symbol)}</p>
                </div>
                <div className="sm:text-center">
                  <p className="text-xs text-center text-muted-foreground">{labels.paid}</p>
                  {totalCalculation.can_calculate ? (
                    <p className="font-semibold text-green-600">
                      {formatAmountCurrency(progressCalculation.totalPaid, userSettings?.base_currency_code, userSettings?.currencies?.symbol)}
                    </p>
                  ) : (
                    <div className="flex justify-center gap-1 text-xs text-yellow-600 mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Kurs belum tersedia</span>
                    </div>
                  )}
                </div>
                <div className="sm:text-center">
                  <p className="text-xs text-muted-foreground">{labels.remaining}</p>
                  <AmountText amount={progressCalculation.remaining} showSign className="font-semibold">
                    {formatAmountCurrency(Math.abs(progressCalculation.remaining), userSettings?.base_currency_code, userSettings?.currencies?.symbol)}
                  </AmountText>
                </div>
                <div className="sm:text-center">
                  <p className="text-xs text-muted-foreground">Progress</p>
                  <p className="font-semibold">{progressCalculation.progressPercentage.toFixed(1)}%</p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Ringkasan</TabsTrigger>
              <TabsTrigger value="history">Riwayat</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              {debtSummary && debtSummary.length > 0 ? (
                <DebtSummaryCard
                  summaryData={debtSummary}
                  title={`Ringkasan ${debt.name}`}
                  debtType={debt.type}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Belum ada transaksi dalam {debt.type === 'loan' ? 'hutang' : 'piutang'} ini</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <DebtHistoryList
                debt={debt}
                onEditHistory={handleEditHistory}
                onDeleteHistory={handleDeleteHistory}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Unified dialog for both add and edit */}
        <DebtHistoryDialog
          open={debtHistoryDialog.open}
          onOpenChange={(open) => setDebtHistoryDialog({ open })}
          debtId={debtId}
          history={debtHistoryDialog.history}
          onSuccess={() => { }}
        />

        {/* Delete confirmation modal */}
        <ConfirmationModal
          open={deleteModal.open}
          onOpenChange={(open) => setDeleteModal({ open })}
          onConfirm={handleConfirmDelete}
          title="Hapus Riwayat"
          description={`Apakah Anda yakin ingin menghapus riwayat ini? Tindakan ini tidak dapat dibatalikan.`}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          variant="destructive"
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
      </Layout>
    </ProtectedRoute>
  );
};

export default DebtHistory;
