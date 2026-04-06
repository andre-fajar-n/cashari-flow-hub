import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, Plus, RotateCcw, Calendar, AlertTriangle, TrendingUp, TrendingDown, Minus, Landmark, BarChart3 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import { useDebtDetail, useMarkDebtAsActive, useMarkDebtAsPaid } from "@/hooks/queries/use-debts";
import { useDebtSummaryById } from "@/hooks/queries/use-debt-summary";
import DebtHistoryDialog from "@/components/debt/DebtHistoryDialog";
import DebtSummaryCard from "@/components/debt/DebtSummaryCard";
import ConfirmationModal from "@/components/ConfirmationModal";
import DebtHistoryList from "@/components/debt/DebtHistoryList";
import PageLoading from "@/components/PageLoading";
import { DebtHistoryModel } from "@/models/debt-histories";
import { useCreateDebtHistory, useDeleteDebtHistory, useUpdateDebtHistory } from "@/hooks/queries/use-debt-histories";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useCategories } from "@/hooks/queries/use-categories";
import { MoneyMovementModel } from "@/models/money-movements";
import { formatAmountCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { AmountText } from "@/components/ui/amount-text";
import { Badge } from "@/components/ui/badge";
import { calculateTotalInBaseCurrency, calculateDebtProgress, getDebtStatusBadge } from "@/lib/debt-summary";
import { useUserSettings } from "@/hooks/queries/use-user-settings";
import { DebtHistoryFormData, defaultDebtHistoryFormValues, mapDebtHistoryToFormData } from "@/form-dto/debt-histories";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useAuth } from "@/hooks/use-auth";
import { useDialogState } from "@/hooks/use-dialog-state";
import { formatPercentage } from "@/lib/number";

const DebtHistory = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
  const [isMarkActiveModalOpen, setIsMarkActiveModalOpen] = useState(false);

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    item?: MoneyMovementModel;
  }>({ open: false });

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const debtId = id ? parseInt(id) : 0;
  const { data: debtSummary } = useDebtSummaryById(debtId);
  const markAsPaid = useMarkDebtAsPaid();
  const markAsActive = useMarkDebtAsActive();
  const { data: debt } = useDebtDetail(debtId);
  const { mutateAsync: deleteDebtHistory } = useDeleteDebtHistory();
  const { data: userSettings } = useUserSettings();
  const { data: wallets } = useWallets();
  const { data: categories } = useCategories();

  // Form for DebtHistoryDialog
  const historyForm = useForm<DebtHistoryFormData>({
    defaultValues: defaultDebtHistoryFormValues,
  });

  // Use dialog state hook for debt history dialog
  const historyDialog = useDialogState<DebtHistoryModel, DebtHistoryFormData>({
    form: historyForm,
    defaultValues: { ...defaultDebtHistoryFormValues, debt_id: debtId.toString() },
    mapDataToForm: mapDebtHistoryToFormData,
  });

  // Mutations
  const createHistory = useCreateDebtHistory();
  const updateHistory = useUpdateDebtHistory();

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
    historyDialog.openAdd();
  };

  // Handler to open dialog for editing existing history
  const handleEditHistory = (history: DebtHistoryModel) => {
    historyDialog.openEdit(history);
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

  // Mutation callbacks
  const { handleSuccess: handleHistorySuccess, handleError: handleHistoryError } = useMutationCallbacks({
    setIsLoading: historyDialog.setIsLoading,
    onOpenChange: (open) => !open && historyDialog.close(),
    form: historyForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.DEBTS
  });

  const handleHistoryFormSubmit = (data: DebtHistoryFormData) => {
    if (!user) return;
    historyDialog.setIsLoading(true);

    const submitData = {
      debt_id: parseInt(data.debt_id) || debtId,
      wallet_id: parseInt(data.wallet_id),
      category_id: parseInt(data.category_id),
      amount: data.amount,
      date: data.date,
      description: data.description || "",
      user_id: user.id,
    };

    if (historyDialog.selectedData) {
      updateHistory.mutate({ id: historyDialog.selectedData.id, ...submitData }, {
        onSuccess: () => historyDialog.handleSuccess(),
        onError: handleHistoryError
      });
    } else {
      createHistory.mutate(submitData, {
        onSuccess: () => historyDialog.handleSuccess(),
        onError: handleHistoryError
      });
    }
  };


  if (!debt) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Landmark className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium mb-1">Hutang/piutang tidak ditemukan</p>
            <p className="text-sm text-muted-foreground mb-4">Data yang Anda cari tidak ada atau telah dihapus</p>
            <Button onClick={() => navigate("/debt")} variant="outline">
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
          {/* Page Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate("/debt")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-3xl font-bold">{debt.name}</h1>
                  <Badge variant={debt.status === 'active' ? 'default' : 'secondary'} className="text-xs px-2.5 py-0.5">
                    {debt.status === 'active' ? 'Aktif' : 'Lunas'}
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5">
                    {debt.type === 'loan' ? 'Hutang' : 'Piutang'}
                  </Badge>
                </div>
                {debt.due_date && (
                  <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Jatuh Tempo: {formatDate(debt.due_date)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {debt.status === 'active' ? (
                <>
                  <Button onClick={handleAddHistory}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Riwayat
                  </Button>
                  <Button onClick={() => setIsMarkPaidModalOpen(true)} variant="outline">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Tandai Lunas
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsMarkActiveModalOpen(true)} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Tandai Aktif
                </Button>
              )}
            </div>
          </div>

          {/* Metric cards */}
          {progressCalculation && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Total Hutang/Piutang */}
              <div className="p-4 rounded-xl border border-orange-100 bg-orange-50/50 shadow-none">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-md bg-orange-500/10 shrink-0">
                    <Landmark className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{labels.initial}</span>
                </div>
                <p className="text-lg font-bold tabular-nums">
                  {formatAmountCurrency(progressCalculation.totalInitial, userSettings?.base_currency_code, userSettings?.currencies?.symbol)}
                </p>
              </div>

              {/* Terbayar/Diterima */}
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50 shadow-none">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-md bg-emerald-500/10 shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{labels.paid}</span>
                </div>
                {totalCalculation.can_calculate ? (
                  <p className="text-lg font-bold tabular-nums text-emerald-600">
                    {formatAmountCurrency(progressCalculation.totalPaid, userSettings?.base_currency_code, userSettings?.currencies?.symbol)}
                  </p>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Kurs belum tersedia</span>
                  </div>
                )}
              </div>

              {/* Sisa */}
              <div className={`p-4 rounded-xl shadow-none ${progressCalculation.remaining >= 0 ? 'border border-emerald-100 bg-emerald-50/50' : 'border border-rose-100 bg-rose-50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-md shrink-0 ${progressCalculation.remaining >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                    <TrendingUp className={`w-3.5 h-3.5 ${progressCalculation.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{labels.remaining}</span>
                </div>
                <AmountText amount={progressCalculation.remaining} showSign className="text-lg font-bold tabular-nums">
                  {formatAmountCurrency(Math.abs(progressCalculation.remaining), userSettings?.base_currency_code, userSettings?.currencies?.symbol)}
                </AmountText>
                <div className="mt-2">
                  {(() => {
                    const badgeInfo = getDebtStatusBadge(progressCalculation.remaining, debt.type);
                    const IconComponent = badgeInfo.icon === 'up' ? TrendingUp : badgeInfo.icon === 'down' ? TrendingDown : Minus;
                    return (
                      <Badge variant={badgeInfo.variant} className={`${badgeInfo.className} text-xs`}>
                        <IconComponent className="w-3 h-3 mr-1" />
                        {badgeInfo.text}
                      </Badge>
                    );
                  })()}
                </div>
              </div>

              {/* Progress */}
              <div className={`p-4 rounded-xl shadow-none ${progressCalculation.progressPercentage > 100 ? 'border border-rose-100 bg-rose-50' : progressCalculation.progressPercentage > 80 ? 'border border-amber-200 bg-amber-50' : 'border border-violet-100 bg-violet-50/50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-md shrink-0 ${progressCalculation.progressPercentage > 100 ? 'bg-rose-500/10' : progressCalculation.progressPercentage > 80 ? 'bg-amber-500/10' : 'bg-violet-500/10'}`}>
                    <BarChart3 className={`w-3.5 h-3.5 ${progressCalculation.progressPercentage > 100 ? 'text-rose-600' : progressCalculation.progressPercentage > 80 ? 'text-amber-600' : 'text-violet-600'}`} />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Progress</span>
                </div>
                <div className="space-y-1.5">
                  <p className={`text-lg font-bold tabular-nums ${progressCalculation.progressPercentage > 100 ? 'text-rose-600' : progressCalculation.progressPercentage > 80 ? 'text-amber-600' : 'text-violet-600'}`}>
                    {formatPercentage(progressCalculation.progressPercentage)}%
                  </p>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${progressCalculation.progressPercentage > 100 ? 'bg-rose-500' : progressCalculation.progressPercentage > 80 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(progressCalculation.progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

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
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-sm mb-1">Belum ada transaksi</p>
                  <p className="text-xs text-muted-foreground">Tambahkan riwayat pembayaran untuk melihat ringkasan</p>
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
          open={historyDialog.open}
          onOpenChange={(open) => !open && historyDialog.close()}
          form={historyForm}
          isLoading={historyDialog.isLoading}
          onSubmit={handleHistoryFormSubmit}
          history={historyDialog.selectedData}
          wallets={wallets}
          categories={categories}
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
