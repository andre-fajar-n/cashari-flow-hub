import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, X, Plus } from "lucide-react";
import { useBudgetTransactions } from "@/hooks/queries/use-budget-transactions";
import { useBudgetTransactionsPaginated } from "@/hooks/queries/paginated/use-budget-transactions-paginated";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import { BudgetModel } from "@/models/budgets";
import { useToast } from "@/hooks/use-toast";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { useCategories } from "@/hooks/queries/use-categories";
import { useWallets } from "@/hooks/queries/use-wallets";
import { formatDate } from "@/lib/date";

interface BudgetTransactionListProps {
  budget: BudgetModel;
  onAddTransaction?: () => void;
}

const BudgetTransactionList = ({ budget, onAddTransaction }: BudgetTransactionListProps) => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [serverSearch, setServerSearch] = useState("");
  const [serverFilters, setServerFilters] = useState<Record<string, any>>({});
  const itemsPerPage = 10;

  const {
    data: budgetTransactions,
    removeTransactionFromBudget
  } = useBudgetTransactions(budget.id);

  const { data: paged, isLoading } = useBudgetTransactionsPaginated({
    budgetId: budget.id,
    page,
    itemsPerPage,
    searchTerm: serverSearch,
    filters: serverFilters
  });

  const { data: categories } = useCategories();
  const { data: wallets } = useWallets();

  const transactions = paged?.data || [];

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

  // Calculate total amounts from all budget transactions (not paginated)
  const totalSpent = budgetTransactions?.reduce((sum, item) => {
    const transaction = item.transactions;
    return sum + (transaction?.amount || 0);
  }, 0) || 0;

  const remainingBudget = budget.amount - totalSpent;
  const spentPercentage = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;

  // Render transaction item for DataTable
  const renderTransactionItem = (item: any) => {
    const transaction = item.transactions;
    return (
      <Card key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              {transaction?.categories?.is_income ? (
                <ArrowUpCircle className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownCircle className="w-4 h-4 text-red-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm truncate">
                  {transaction?.description || 'No description'}
                </p>
                <Badge variant="outline" className="text-xs">
                  {transaction?.categories?.name}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatDate(transaction?.date || '')}</span>
                <span>•</span>
                <span>{transaction?.wallets?.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <AmountText
                amount={transaction?.categories?.is_income ? transaction.amount : -transaction.amount}
                className="font-semibold text-sm"
                showSign={true}
              >
                {formatAmountCurrency(transaction?.amount || 0, transaction?.wallets?.currency_code || budget.currency_code)}
              </AmountText>
              <Badge variant="outline" className="text-xs mt-1">
                {transaction?.wallets?.currency_code}
              </Badge>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveTransaction(transaction?.id || 0)}
              className="text-destructive hover:text-destructive h-8 w-8 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // Column filters for DataTable
  const columnFilters: ColumnFilter[] = [
    {
      field: "transactions.categories.is_income",
      label: "Tipe",
      type: "select",
      options: [
        { label: "Pemasukan", value: "true" },
        { label: "Pengeluaran", value: "false" }
      ]
    },
    {
      field: "transactions.category_id",
      label: "Kategori",
      type: "select",
      options: categories?.map(category => ({
        label: category.name,
        value: category.id.toString()
      })) || []
    },
    {
      field: "transactions.wallet_id",
      label: "Dompet",
      type: "select",
      options: wallets?.map(wallet => ({
        label: `${wallet.name} (${wallet.currency_code})`,
        value: wallet.id.toString()
      })) || []
    },
    {
      field: "transactions.date",
      label: "Tanggal",
      type: "date"
    }
  ];

  return (
    <div className="space-y-6">
      <DataTable
        data={transactions}
        isLoading={isLoading}
        searchPlaceholder="Cari transaksi dalam budget..."
        searchFields={["transactions.description", "transactions.amount"]}
        columnFilters={columnFilters}
        itemsPerPage={itemsPerPage}
        serverMode
        totalCount={paged?.count}
        page={page}
        onServerParamsChange={({ searchTerm, filters, page: nextPage }) => {
          setServerSearch(searchTerm);
          setServerFilters(filters);
          setPage(nextPage);
        }}
        useUrlParams={true}
        renderItem={renderTransactionItem}
        emptyStateMessage="Belum ada transaksi dalam budget ini"
        title={`Transaksi dalam Budget (${paged?.count || 0})`}
        description={`Total terpakai: ${formatAmountCurrency(totalSpent, budget.currency_code)} dari ${formatAmountCurrency(budget.amount, budget.currency_code)}`}
        headerActions={
          onAddTransaction && (
            <Button onClick={onAddTransaction} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Transaksi
            </Button>
          )
        }
      />
    </div>
  );
};

export default BudgetTransactionList;
