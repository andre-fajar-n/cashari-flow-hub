import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpCircle, ArrowDownCircle, X } from "lucide-react";
import { useBusinessProjectTransactions } from "@/hooks/queries/use-business-project-transactions";
import { useBusinessProjectTransactionsPaginated } from "@/hooks/queries/paginated/use-business-project-transactions-paginated";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import { BusinessProjectModel } from "@/models/business-projects";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { useCategories } from "@/hooks/queries/use-categories";
import { useWallets } from "@/hooks/queries/use-wallets";

interface BusinessProjectTransactionListProps {
  project: BusinessProjectModel;
  onAddTransaction?: () => void;
}

const BusinessProjectTransactionList = ({ project, onAddTransaction }: BusinessProjectTransactionListProps) => {
  const [page, setPage] = useState(1);
  const [serverSearch, setServerSearch] = useState("");
  const [serverFilters, setServerFilters] = useState<Record<string, any>>({});
  const itemsPerPage = 10;

  const {
    data: projectTransactions,
    removeTransactionFromProject
  } = useBusinessProjectTransactions(project.id);

  const { data: paged, isLoading } = useBusinessProjectTransactionsPaginated({
    projectId: project.id,
    page,
    itemsPerPage,
    searchTerm: serverSearch,
    filters: serverFilters
  });

  const { data: categories } = useCategories();
  const { data: wallets } = useWallets();

  const transactions = paged?.data || [];

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

  // Calculate total amounts from all project transactions (not paginated)
  const totalIncome = projectTransactions?.reduce((sum, item) => {
    const transaction = item.transactions;
    return transaction.categories?.is_income ? sum + Number(transaction.amount) : sum;
  }, 0) || 0;

  const totalExpense = projectTransactions?.reduce((sum, item) => {
    const transaction = item.transactions;
    return !transaction.categories?.is_income ? sum + Number(transaction.amount) : sum;
  }, 0) || 0;

  const netAmount = totalIncome - totalExpense;

  // Render transaction item for DataTable
  const renderTransactionItem = (item: any) => {
    const transaction = item.transactions;
    return (
      <Card key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              {transaction.categories?.is_income ? (
                <ArrowUpCircle className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownCircle className="w-4 h-4 text-red-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm truncate">
                  {transaction.description || 'No description'}
                </p>
                <Badge variant="outline" className="text-xs">
                  {transaction.categories?.name}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatDate(transaction.date || '')}</span>
                <span>•</span>
                <span>{transaction.wallets?.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <AmountText
                amount={transaction.categories?.is_income ? transaction.amount : -transaction.amount}
                className="font-semibold text-sm"
                showSign={true}
              >
                {formatAmountCurrency(transaction.amount || 0, transaction.wallets?.currency_code || "IDR")}
              </AmountText>
              <Badge variant="outline" className="text-xs mt-1">
                {transaction.wallets?.currency_code}
              </Badge>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveTransaction(transaction.id || 0)}
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

      {/* Transaction List */}
      <DataTable
        data={transactions}
        isLoading={isLoading}
        searchPlaceholder="Cari transaksi dalam proyek..."
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
        emptyStateMessage="Belum ada transaksi di proyek ini"
        title={`Transaksi dalam Proyek (${paged?.count || 0})`}
        description={`Net: ${formatAmountCurrency(Math.abs(netAmount), "IDR")} ${netAmount >= 0 ? 'Profit' : 'Loss'}`}
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

export default BusinessProjectTransactionList;
