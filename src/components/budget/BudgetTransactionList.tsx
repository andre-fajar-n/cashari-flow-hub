import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, X, Plus } from "lucide-react";
import { useBudgetTransactions } from "@/hooks/queries/use-budget-transactions";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import { BudgetModel } from "@/models/budgets";
import BudgetTransactionDialog from "@/components/budget/BudgetTransactionDialog";
import { useToast } from "@/hooks/use-toast";

interface BudgetTransactionListProps {
  budget: BudgetModel;
}

const BudgetTransactionList = ({ budget }: BudgetTransactionListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { 
    data: budgetTransactions, 
    isLoading, 
    removeTransactionFromBudget 
  } = useBudgetTransactions(budget.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleRemoveTransaction = async (transactionId: number) => {
    try {
      await removeTransactionFromBudget.mutateAsync({
        budgetId: budget.id,
        transactionId
      });
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil dihapus dari budget",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus transaksi dari budget",
        variant: "destructive",
      });
    }
  };

  const totalSpent = budgetTransactions?.reduce((sum, item) => {
    const transaction = item.transactions;
    return sum + (transaction?.amount || 0);
  }, 0) || 0;

  const remainingBudget = budget.amount - totalSpent;
  const spentPercentage = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Budget Summary */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{budget.name}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
              </p>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Transaksi
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="font-semibold">
                {formatAmountCurrency(budget.amount, budget.currency_code)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Terpakai</p>
              <AmountText
                amount={-totalSpent}
                className="font-semibold"
                showSign={true}
              >
                {formatAmountCurrency(totalSpent, budget.currency_code)}
              </AmountText>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sisa Budget</p>
              <AmountText
                amount={remainingBudget}
                className="font-semibold"
                showSign={true}
              >
                {formatAmountCurrency(Math.abs(remainingBudget), budget.currency_code)}
              </AmountText>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{spentPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  spentPercentage > 100 
                    ? 'bg-destructive' 
                    : spentPercentage > 80 
                    ? 'bg-yellow-500' 
                    : 'bg-primary'
                }`}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Transaction List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">
            Transaksi dalam Budget ({budgetTransactions?.length || 0})
          </h4>
        </div>

        {!budgetTransactions || budgetTransactions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Belum ada transaksi dalam budget ini
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="mt-4"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Transaksi Pertama
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {budgetTransactions.map((item) => {
              const transaction = item.transactions;
              return (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0">
                        {transaction?.categories?.is_income ? (
                          <ArrowUpCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowDownCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{transaction?.categories?.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{transaction?.wallets?.name}</span>
                          <span>•</span>
                          <span>{formatDate(transaction?.date || '')}</span>
                        </div>
                        {transaction?.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <AmountText
                          amount={transaction?.categories?.is_income ? transaction.amount : -transaction.amount}
                          className="font-semibold"
                          showSign={true}
                        >
                          {formatAmountCurrency(transaction?.amount || 0, transaction?.currency_code || budget.currency_code)}
                        </AmountText>
                        <Badge variant="outline" className="mt-1">
                          {transaction?.currency_code}
                        </Badge>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTransaction(transaction?.id || 0)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <BudgetTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        budget={budget}
        onSuccess={() => {
          toast({
            title: "Berhasil",
            description: "Transaksi berhasil ditambahkan ke budget",
          });
        }}
      />
    </div>
  );
};

export default BudgetTransactionList;
