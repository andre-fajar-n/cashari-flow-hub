import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Calendar, Plus, AlertTriangle, PiggyBank, TrendingDown, Wallet, BarChart3, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useBudget, useDeleteBudget, useUpdateBudget } from "@/hooks/queries/use-budgets";
import BudgetTransactionList from "@/components/budget/BudgetTransactionList";
import BudgetDialog from "@/components/budget/BudgetDialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import BudgetTransactionDialog from "@/components/budget/BudgetTransactionDialog";
import BudgetSummaryCard from "@/components/budget/BudgetSummaryCard";
import { formatAmountCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { useBudgetSummary } from "@/hooks/queries/use-budget-summary";
import { calculateTotalSpentInBaseCurrency } from "@/lib/budget-summary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetFormData, defaultBudgetFormValues, mapBudgetToFormData } from "@/form-dto/budget";
import { useBudgetThresholdAlerts } from "@/hooks/use-budget-threshold-alerts";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useTransactions } from "@/hooks/queries/use-transactions";
import { useBudgetTransactionsByBudgetId, useCreateBudgetItem } from "@/hooks/queries/use-budget-transactions";
import { TransactionFilter } from "@/form-dto/transactions";
import { useDialogState } from "@/hooks/use-dialog-state";
import { BudgetModel } from "@/models/budgets";
import { useUserSettings } from "@/hooks/queries/use-user-settings";
import { formatPercentage } from "@/lib/number";

const BudgetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("summary");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // State for BudgetTransactionDialog
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingTransactions, setIsAddingTransactions] = useState(false);

  const { data: budget } = useBudget(parseInt(id!));
  const updateBudget = useUpdateBudget();
  const { mutate: deleteBudget } = useDeleteBudget();
  const { data: budgetSummary } = useBudgetSummary(parseInt(id!));
  const addTransactionsToBudget = useCreateBudgetItem();
  const { data: userSettings } = useUserSettings();

  // Form state managed at page level
  const form = useForm<BudgetFormData>({
    defaultValues: defaultBudgetFormValues,
  });

  // Use dialog state hook for budget edit dialog
  const budgetDialog = useDialogState<BudgetModel, BudgetFormData>({
    form,
    defaultValues: defaultBudgetFormValues,
    mapDataToForm: mapBudgetToFormData,
  });

  // Transactions data for the add dialog
  const filter: TransactionFilter = {
    startDate: budget?.start_date,
    endDate: budget?.end_date
  };
  const { data: allTransactions } = useTransactions(filter);
  const { data: budgetTransactions } = useBudgetTransactionsByBudgetId(budget?.id);

  // Get transactions that are not already in this budget
  const availableTransactions = allTransactions?.filter(transaction => {
    const isAlreadyInBudget = budgetTransactions?.some(
      budgetTrx => budgetTrx.resource_id === transaction.id
    );
    return !isAlreadyInBudget;
  }) || [];

  // Filter transactions based on search query
  const filteredTransactions = availableTransactions.filter(transaction => {
    const searchLower = searchQuery.toLowerCase();
    return (
      transaction.description?.toLowerCase().includes(searchLower) ||
      transaction.categories?.name?.toLowerCase().includes(searchLower) ||
      transaction.wallets?.name?.toLowerCase().includes(searchLower) ||
      transaction.amount.toString().includes(searchQuery)
    );
  });

  // Reset selection when dialog closes
  useEffect(() => {
    if (!isAddDialogOpen) {
      setSelectedTransactionIds([]);
      setSearchQuery("");
    }
  }, [isAddDialogOpen]);

  const handleTransactionToggle = (transactionId: number) => {
    setSelectedTransactionIds(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId);
      } else {
        return [...prev, transactionId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedTransactionIds.length === filteredTransactions.length) {
      setSelectedTransactionIds([]);
    } else {
      setSelectedTransactionIds(filteredTransactions.map(t => t.id));
    }
  };

  const handleAddTransactionsSubmit = async () => {
    if (!budget || selectedTransactionIds.length === 0) return;

    setIsAddingTransactions(true);
    try {
      await addTransactionsToBudget.mutateAsync({
        budgetId: budget.id,
        transactionIds: selectedTransactionIds
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add transactions to budget", error);
    } finally {
      setIsAddingTransactions(false);
    }
  };

  // Mutation callbacks
  const { handleSuccess, handleError } = useMutationCallbacks({
    setIsLoading: budgetDialog.setIsLoading,
    onOpenChange: (open) => !open && budgetDialog.close(),
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.BUDGETS
  });

  const handleFormSubmit = (data: BudgetFormData) => {
    if (!budget) return;
    budgetDialog.setIsLoading(true);
    updateBudget.mutate({ id: budget.id, ...data }, {
      onSuccess: () => {
        handleSuccess();
      },
      onError: handleError
    });
  };

  // Calculate total spent from budget summary
  const totalCalculation = useMemo(() => {
    if (!budgetSummary || budgetSummary.length === 0) {
      return { total_spent: 0, can_calculate: true, base_currency_code: userSettings?.currencies.code || null };
    }
    return calculateTotalSpentInBaseCurrency(budgetSummary);
  }, [budgetSummary, userSettings?.currencies.code]);

  const totalSpent = totalCalculation.total_spent || 0;
  const remainingBudget = (budget?.amount || 0) + totalSpent;
  const spentPercentage = budget?.amount ? (Math.abs(totalSpent) / budget.amount) * 100 : 0;

  // Fire threshold alerts when budget crosses 80% or 100%
  useBudgetThresholdAlerts(budget, spentPercentage);

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
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">Budget tidak ditemukan</p>
            <Button onClick={() => navigate("/budget")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
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
          {/* Page Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate("/budget")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{budget.name}</h1>
                <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(budget.start_date)} — {formatDate(budget.end_date)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Transaksi
              </Button>
              <Button variant="outline" onClick={() => budget && budgetDialog.openEdit(budget)}>
                <Edit className="w-4 h-4 mr-2" />
                Ubah
              </Button>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus
              </Button>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Total Budget */}
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 shadow-none">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-md bg-blue-500/10 shrink-0">
                  <Wallet className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Total Budget</span>
              </div>
              <p className="text-lg font-bold tabular-nums">
                {formatAmountCurrency(budget.amount, userSettings?.currencies.code, userSettings?.currencies.symbol)}
              </p>
            </div>

            {/* Terpakai */}
            <div className="p-4 rounded-xl border border-rose-100 bg-rose-50 shadow-none">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-md bg-rose-500/10 shrink-0">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1 cursor-help">
                      Terpakai
                      <HelpCircle className="w-3 h-3 shrink-0" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-sm">Total pengeluaran yang dikonversi ke mata uang dasar</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {totalCalculation.can_calculate ? (
                <p className="text-lg font-bold tabular-nums text-rose-600">
                  {formatAmountCurrency(Math.abs(totalSpent), userSettings?.currencies.code, userSettings?.currencies.symbol)}
                </p>
              ) : (
                <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Kurs belum tersedia</span>
                </div>
              )}
            </div>

            {/* Sisa / Kelebihan */}
            <div className={`p-4 rounded-xl shadow-none ${remainingBudget >= 0 ? 'border border-emerald-100 bg-emerald-50' : 'border border-rose-100 bg-rose-50'}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-md shrink-0 ${remainingBudget >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                  <PiggyBank className={`w-3.5 h-3.5 ${remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {remainingBudget >= 0 ? 'Sisa Budget' : 'Kelebihan'}
                </span>
              </div>
              <p className={`text-lg font-bold tabular-nums ${remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatAmountCurrency(Math.abs(remainingBudget), userSettings?.currencies.code, userSettings?.currencies.symbol)}
              </p>
            </div>

            {/* Progress */}
            <div className={`p-4 rounded-xl shadow-none ${spentPercentage > 100 ? 'border border-rose-100 bg-rose-50' : spentPercentage > 80 ? 'border border-amber-200 bg-amber-50' : 'border border-violet-100 bg-violet-50/50'}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-md shrink-0 ${spentPercentage > 100 ? 'bg-rose-500/10' : spentPercentage > 80 ? 'bg-amber-500/10' : 'bg-violet-500/10'}`}>
                  <BarChart3 className={`w-3.5 h-3.5 ${spentPercentage > 100 ? 'text-rose-600' : spentPercentage > 80 ? 'text-amber-600' : 'text-violet-600'}`} />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Progress</span>
              </div>
              <div className="space-y-1.5">
                <p className={`text-lg font-bold tabular-nums ${spentPercentage > 100 ? 'text-rose-600' : spentPercentage > 80 ? 'text-amber-600' : 'text-violet-600'}`}>
                  {formatPercentage(spentPercentage)}%
                </p>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${spentPercentage > 100 ? 'bg-rose-500' : spentPercentage > 80 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                  />
                </div>
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
          open={budgetDialog.open}
          onOpenChange={(open) => !open && budgetDialog.close()}
          form={form}
          isLoading={budgetDialog.isLoading}
          onSubmit={handleFormSubmit}
          budget={budget}
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
          isLoading={isAddingTransactions}
          selectedTransactionIds={selectedTransactionIds}
          onTransactionToggle={handleTransactionToggle}
          onSelectAll={handleSelectAll}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filteredTransactions={filteredTransactions}
          availableTransactionsCount={availableTransactions.length}
          onSubmit={handleAddTransactionsSubmit}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default BudgetDetail;
