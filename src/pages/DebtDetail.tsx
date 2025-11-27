import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, Plus, RotateCcw } from "lucide-react";
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
                  <Button onClick={handleAddHistory}>
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
          description={`Apakah Anda yakin ingin menghapus riwayat ini? Tindakan ini tidak dapat dibatalkan.`}
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
