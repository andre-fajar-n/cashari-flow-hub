import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpCircle, ArrowDownCircle, X } from "lucide-react";
import { useBusinessProjectTransactions } from "@/hooks/queries/use-business-project-transactions";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import { BusinessProjectModel } from "@/models/business-projects";
import BusinessProjectTransactionDialog from "@/components/business-project/BusinessProjectTransactionDialog";

interface BusinessProjectTransactionListProps {
  project: BusinessProjectModel;
}

const BusinessProjectTransactionList = ({ project }: BusinessProjectTransactionListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { 
    data: projectTransactions, 
    removeTransactionFromProject,
    refetch 
  } = useBusinessProjectTransactions(project.id);

  const handleRemoveTransaction = (transactionId: number) => {
    removeTransactionFromProject.mutate({
      projectId: project.id,
      transactionId
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate total amounts
  const totalIncome = projectTransactions?.reduce((sum, item) => {
    const transaction = item.transactions;
    return transaction.categories?.is_income ? sum + Number(transaction.amount) : sum;
  }, 0) || 0;

  const totalExpense = projectTransactions?.reduce((sum, item) => {
    const transaction = item.transactions;
    return !transaction.categories?.is_income ? sum + Number(transaction.amount) : sum;
  }, 0) || 0;

  const netAmount = totalIncome - totalExpense;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Total Pemasukan</span>
          </div>
          <AmountText amount={totalIncome} className="text-lg font-bold mt-1" showSign={false}>
            {formatAmountCurrency(totalIncome, "IDR")}
          </AmountText>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium">Total Pengeluaran</span>
          </div>
          <AmountText amount={-totalExpense} className="text-lg font-bold mt-1" showSign={false}>
            {formatAmountCurrency(totalExpense, "IDR")}
          </AmountText>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${netAmount >= 0 ? 'bg-green-600' : 'bg-red-600'}`} />
            <span className="text-sm font-medium">Net</span>
          </div>
          <AmountText amount={netAmount} className="text-lg font-bold mt-1" showSign={true}>
            {formatAmountCurrency(Math.abs(netAmount), "IDR")}
          </AmountText>
        </Card>
      </div>

      {/* Add Transaction Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Transaksi Proyek</h3>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Transaksi
        </Button>
      </div>

      {/* Transaction List */}
      <div className="space-y-3 pb-6">
        {projectTransactions && projectTransactions.length > 0 ? (
          projectTransactions.map((item) => {
            const transaction = item.transactions;
            return (
              <Card key={item.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      {transaction.categories?.is_income ? (
                        <ArrowUpCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{transaction.categories?.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {transaction.wallets?.name}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>{formatDate(transaction.date)}</span>
                        {transaction.description && (
                          <>
                            <span>•</span>
                            <span className="truncate">{transaction.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <AmountText
                        amount={transaction.categories?.is_income ? transaction.amount : -transaction.amount}
                        className="font-semibold"
                        showSign={true}
                      >
                        {formatAmountCurrency(transaction.amount, transaction.wallets?.currency_code)}
                      </AmountText>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {transaction.wallets?.currency_code}
                      </Badge>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTransaction(transaction.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            <div className="space-y-2">
              <p>Belum ada transaksi di proyek ini</p>
              <Button onClick={() => setIsDialogOpen(true)} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Transaksi Pertama
              </Button>
            </div>
          </Card>
        )}
      </div>

      <BusinessProjectTransactionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        project={project}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
};

export default BusinessProjectTransactionList;
