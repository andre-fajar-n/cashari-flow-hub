import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, X, Plus } from "lucide-react";
import { useBudgetTransactions } from "@/hooks/queries/use-budget-transactions";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import { BudgetModel } from "@/models/budgets";
import { useToast } from "@/hooks/use-toast";

interface BudgetTransactionListProps {
  budget: BudgetModel;
  onAddTransaction?: () => void;
}

const BudgetTransactionList = ({ budget, onAddTransaction }: BudgetTransactionListProps) => {
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

  // Sort transactions by date descending
  const getTime = (d?: string) => (d ? new Date(d).getTime() : 0);
  const sortedBudgetTransactions = [...(budgetTransactions || [])].sort((a, b) =>
    getTime(b.transactions?.date) - getTime(a.transactions?.date)
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Transaction List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">
            Transaksi dalam Budget ({sortedBudgetTransactions.length || 0})
          </h4>
        </div>

        {!sortedBudgetTransactions || sortedBudgetTransactions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Belum ada transaksi dalam budget ini
            </p>
            {onAddTransaction && (
              <Button
                onClick={onAddTransaction}
                className="mt-4"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Transaksi Pertama
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-2 pb-6">
            {sortedBudgetTransactions.map((item) => {
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
                          {formatAmountCurrency(transaction?.amount || 0, transaction?.wallets?.currency_code || budget.currency_code)}
                        </AmountText>
                        <Badge variant="outline" className="mt-1">
                          {transaction?.wallets?.currency_code}
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


    </div>
  );
};

export default BudgetTransactionList;
