import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, X } from "lucide-react";
import { useDeleteBudgetItem } from "@/hooks/queries/use-budget-transactions";
import { useBudgetTransactionsPaginated } from "@/hooks/queries/paginated/use-budget-transactions-paginated";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import { BudgetItemWithTransactions, BudgetModel } from "@/models/budgets";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { useCategories } from "@/hooks/queries/use-categories";
import { useWallets } from "@/hooks/queries/use-wallets";
import { formatDate } from "@/lib/date";

interface BudgetTransactionListProps {
  budget: BudgetModel;
}

const BudgetTransactionList = ({ budget }: BudgetTransactionListProps) => {
  const [page, setPage] = useState(1);
  const [serverSearch, setServerSearch] = useState("");
  const [serverFilters, setServerFilters] = useState<Record<string, any>>({});
  const itemsPerPage = 10;

  const removeTransactionFromBudget = useDeleteBudgetItem();

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

  const handleRemoveTransaction = (transactionId: number) => {
    removeTransactionFromBudget.mutateAsync({
      budgetId: budget.id,
      transactionId
    })
  };

  // Render transaction item for DataTable
  const renderTransactionItem = (item: BudgetItemWithTransactions) => {
    const isIncome = item.amount > 0;
    const isExpense = item.amount < 0;
    const isDifferentCurrency = item.exchange_rate !== 1;
    const originalAmount = Math.abs(item.amount);
    const convertedAmount = Math.abs(item.amount * item.exchange_rate);

    return (
      <Card key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between gap-4">
          {/* Left section - Icon and transaction details */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-0.5">
              {isIncome ? (
                <ArrowUpCircle className="w-5 h-5 text-green-600" />
              ) : isExpense ? (
                <ArrowDownCircle className="w-5 h-5 text-red-600" />
              ) : (
                <div className="w-5 h-5 bg-gray-200 rounded-full" />
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              {/* Category name */}
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-gray-900 truncate">
                  {item.category_name}
                </h4>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 truncate">
                {item.description || 'Tanpa deskripsi'}
              </p>

              {/* Date and wallet info */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium">{formatDate(item.date || '')}</span>
                <span>•</span>
                <span className="truncate">{item.wallet_name}</span>
              </div>
            </div>
          </div>

          {/* Right section - Amount and actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right space-y-1">
              {/* Main amount display */}
              <div className="flex flex-col items-end">
                <AmountText
                  amount={item.amount}
                  className="font-bold text-base"
                  showSign={true}
                >
                  {formatAmountCurrency(originalAmount, item.original_currency_code)}
                </AmountText>

                {/* Show converted amount if different currency and rate is available */}
                {isDifferentCurrency && item.exchange_rate && (
                  <div className="flex flex-col items-end mt-1">
                    <AmountText
                      amount={item.amount}
                      className="font-medium text-sm text-gray-600"
                      showSign={true}
                    >
                      {formatAmountCurrency(convertedAmount, budget.currency_code)}
                    </AmountText>
                    <span className="text-xs text-gray-400 mt-0.5">
                      (Rate: {item.exchange_rate?.toFixed(4)})
                    </span>
                  </div>
                )}

                {/* Show warning if rate is not available */}
                {!item.exchange_rate && (
                  <div className="flex flex-col items-end mt-1">
                    <span className="text-xs text-yellow-600 mt-0.5">
                      (Rate belum tersedia)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Remove button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveTransaction(item.id)}
              className="text-destructive hover:text-destructive hover:bg-red-50 h-8 w-8 p-0 mt-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // Column filters for DataTable
  const columnFilters: ColumnFilter[] = [
    {
      field: "category_id",
      label: "Kategori",
      type: "select",
      options: categories?.map(category => ({
        label: category.name,
        value: category.id.toString()
      })) || []
    },
    {
      field: "wallet_id",
      label: "Dompet",
      type: "select",
      options: wallets?.map(wallet => ({
        label: `${wallet.name} (${wallet.currency_code})`,
        value: wallet.id.toString()
      })) || []
    },
    {
      field: "date",
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
      />
    </div>
  );
};

export default BudgetTransactionList;
