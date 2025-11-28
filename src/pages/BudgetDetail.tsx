import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Calendar, Plus, AlertTriangle } from "lucide-react";
import { useBudget, useDeleteBudget } from "@/hooks/queries/use-budgets";
import BudgetTransactionList from "@/components/budget/BudgetTransactionList";
import BudgetDialog from "@/components/budget/BudgetDialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import BudgetTransactionDialog from "@/components/budget/BudgetTransactionDialog";
import BudgetSummaryCard from "@/components/budget/BudgetSummaryCard";
import { AmountText } from "@/components/ui/amount-text";
import { formatAmountCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { useBudgetSummary } from "@/hooks/queries/use-budget-summary";
import { calculateTotalSpentInBaseCurrency } from "@/lib/budget-summary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BudgetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("summary");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: budget } = useBudget(parseInt(id!));
  const { mutate: deleteBudget } = useDeleteBudget();
  const { data: budgetSummary } = useBudgetSummary(parseInt(id!));

  // Calculate total spent from budget summary
  const totalCalculation = useMemo(() => {
    if (!budgetSummary || budgetSummary.length === 0) {
      return { total_spent: 0, can_calculate: true, base_currency_code: budget?.currency_code || null };
    }
    return calculateTotalSpentInBaseCurrency(budgetSummary);
  }, [budgetSummary, budget?.currency_code]);

  const totalSpent = totalCalculation.total_spent || 0;
  const remainingBudget = (budget?.amount || 0) + totalSpent;
  const spentPercentage = budget?.amount ? (Math.abs(totalSpent) / budget.amount) * 100 : 0;

  const handleDelete = () => {
    if (!budget) return;
    deleteBudget(budget.id);
    setIsDeleteModalOpen(false);
    navigate("/budget");
  };

  if (!budget) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Budget tidak ditemukan</p>
            <Button
              onClick={() => navigate("/budget")}
              className="mt-4"
              variant="outline"
            >
              Kembali ke Daftar Budget
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
                <Button variant="ghost" size="sm" onClick={() => navigate("/budget")}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{budget.name}</h1>
                  <p className="text-muted-foreground mt-0.5 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pr-1">
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Tambah Transaksi
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" /> Ubah
                </Button>
                <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Hapus
                </Button>
              </div>
            </div>

            {/* Compact stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-2 px-2 border-t">
              <div className="sm:text-center">
                <p className="text-xs text-muted-foreground">Total Budget</p>
                <p className="font-semibold">{formatAmountCurrency(budget.amount, budget.currency_code)}</p>
              </div>
              <div className="sm:text-center">
                <p className="text-xs text-center text-muted-foreground">Terpakai</p>
                {totalCalculation.can_calculate ? (
                  <AmountText amount={totalSpent} showSign className="font-semibold">
                    {formatAmountCurrency(Math.abs(totalSpent), budget.currency_code)}
                  </AmountText>
                ) : (
                  <div className="flex justify-center gap-1 text-xs text-yellow-600 mt-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Exchange rate belum tersedia</span>
                  </div>
                )}
              </div>
              <div className="sm:text-center">
                <p className="text-xs text-muted-foreground">{remainingBudget >= 0 ? 'Sisa Budget' : 'Kelebihan'}</p>
                <AmountText amount={remainingBudget} showSign className="font-semibold">
                  {formatAmountCurrency(Math.abs(remainingBudget), budget.currency_code)}
                </AmountText>
              </div>
              <div className="sm:text-center">
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="font-semibold">{spentPercentage.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Ringkasan</TabsTrigger>
              <TabsTrigger value="history">Riwayat</TabsTrigger>
            </TabsList>

            {/* Budget Summary */}
            <TabsContent value="summary" className="space-y-4">
              {budgetSummary && budgetSummary.length > 0 ? (
                <BudgetSummaryCard
                  summaryData={budgetSummary}
                  showDetailedBreakdown={true}
                  title={`Ringkasan Pengeluaran - ${budget.name}`}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Belum ada transaksi dalam budget ini</p>
                </div>
              )}
            </TabsContent>

            {/* Transaction list */}
            <TabsContent value="history" className="space-y-4">
              <BudgetTransactionList budget={budget} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Edit dialog */}
        <BudgetDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          budget={budget}
          onSuccess={() => { /* budgets query key invalidated inside dialog */ }}
        />

        {/* Delete confirmation */}
        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          title="Hapus Budget"
          description={`Yakin ingin menghapus budget "${budget.name}"?`}
          onConfirm={handleDelete}
        />

        {/* Add transactions dialog */}
        <BudgetTransactionDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          budget={budget}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default BudgetDetail;

