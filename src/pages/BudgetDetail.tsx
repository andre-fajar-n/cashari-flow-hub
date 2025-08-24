import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Calendar, Plus } from "lucide-react";
import { useBudgets, useDeleteBudget } from "@/hooks/queries/use-budgets";
import BudgetTransactionList from "@/components/budget/BudgetTransactionList";
import BudgetDialog from "@/components/budget/BudgetDialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import BudgetTransactionDialog from "@/components/budget/BudgetTransactionDialog";
import { AmountText } from "@/components/ui/amount-text";
import { formatAmountCurrency } from "@/lib/currency";
import { useBudgetTransactions } from "@/hooks/queries/use-budget-transactions";

const BudgetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: budgets } = useBudgets();
  const budget = budgets?.find(b => b.id === parseInt(id || "0"));
  const { mutate: deleteBudget } = useDeleteBudget();
  const { data: budgetTransactions } = useBudgetTransactions(budget?.id);

  const totalSpent = budgetTransactions?.reduce((sum, item) => sum + (item.transactions?.amount || 0), 0) || 0;
  const remainingBudget = (budget?.amount || 0) - totalSpent;
  const spentPercentage = budget?.amount ? (totalSpent / budget.amount) * 100 : 0;

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
                    {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pr-1">
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Tambah Transaksi
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
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
                <p className="text-xs text-muted-foreground">Terpakai</p>
                <AmountText amount={-totalSpent} showSign className="font-semibold">
                  {formatAmountCurrency(totalSpent, budget.currency_code)}
                </AmountText>
              </div>
              <div className="sm:text-center">
                <p className="text-xs text-muted-foreground">Sisa Budget</p>
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

          {/* Transaction list */}
          <BudgetTransactionList budget={budget} onAddTransaction={() => setIsAddDialogOpen(true)} />
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

