import { useMoneyMovementsPaginatedByDebt } from "@/hooks/queries/paginated/use-money-movements-paginated";
import { DebtModel } from "@/models/debts";
import { useDebtCategories } from "@/hooks/queries/use-categories";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useTableState } from "@/hooks/use-table-state";
import { SelectFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { TransactionHistoryTable } from "@/components/transactions/TransactionHistoryTable";
import { getTransactionHistoryColumns } from "@/components/transactions/TransactionHistoryColumns";
import { MoneyMovementModel } from "@/models/money-movements";
import { MOVEMENT_TYPES } from "@/constants/enums";
import { DebtHistoryModel } from "@/models/debt-histories";
import { useDebtHistories } from "@/hooks/queries/use-debt-histories";

interface DebtHistoryListProps {
  debt: DebtModel;
  onEditHistory: (history: DebtHistoryModel) => void;
  onDeleteHistory: (item: MoneyMovementModel) => void;
}

const DebtHistoryList = ({ debt, onEditHistory, onDeleteHistory }: DebtHistoryListProps) => {
  // Table state management using generic hook
  const { state: tableState, actions: tableActions } = useTableState({
    initialPage: 1,
    initialPageSize: 10,
  });

  const { data: paged, isLoading: isMovementsLoading } = useMoneyMovementsPaginatedByDebt(debt.id, {
    page: tableState.page,
    itemsPerPage: tableState.pageSize,
    searchTerm: tableState.searchTerm,
    filters: tableState.filters
  });

  const { data: categories } = useDebtCategories();
  const { data: wallets } = useWallets();

  const movements = paged?.data || [];
  const totalCount = paged?.count || 0;

  const debtHistoryIds = movements?.filter(m => m.resource_type === MOVEMENT_TYPES.DEBT_HISTORY).map(m => m.resource_id) || [];
  const { data: debtHistories, isLoading: isDebtHistoriesLoading } = useDebtHistories({ ids: debtHistoryIds });
  const debtHistoriesGroupById = debtHistories?.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<number, DebtHistoryModel>);

  const isLoading = isMovementsLoading || isDebtHistoriesLoading;

  const handleEdit = (movement: MoneyMovementModel) => {
    // Find the full transaction data
    const debtHistory = debtHistoriesGroupById[movement.resource_id];
    if (debtHistory) {
      onEditHistory(debtHistory);
    }
  };

  const handleDelete = (movement: MoneyMovementModel) => {
    onDeleteHistory(movement);
  };

  // Generate columns
  const columns = getTransactionHistoryColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    hideResourceType: true,
    hideAdditionalInfo: true,
  });

  // Select filters configuration
  const selectFilters: SelectFilterConfig[] = [
    {
      key: "category_id",
      label: "Kategori",
      placeholder: "Semua Kategori",
      options: categories?.map(category => ({
        label: category.name,
        value: category.id.toString()
      })) || []
    },
    {
      key: "wallet_id",
      label: "Dompet",
      placeholder: "Semua Dompet",
      options: wallets?.map(wallet => ({
        label: `${wallet.name} (${wallet.currency_code})`,
        value: wallet.id.toString()
      })) || []
    },
  ];

  // Date range filter configuration
  const dateRangeFilter = {
    key: "date",
    label: "Tanggal",
    placeholder: "Pilih rentang tanggal",
  };

  return (
    <TransactionHistoryTable
      columns={columns}
      data={movements}
      totalCount={totalCount}
      isLoading={isLoading}
      searchTerm={tableState.searchTerm}
      onSearchChange={tableActions.handleSearchChange}
      filters={tableState.filters}
      onFiltersChange={tableActions.handleFiltersChange}
      selectFilters={selectFilters}
      dateRangeFilter={dateRangeFilter}
      page={tableState.page}
      pageSize={tableState.pageSize}
      setPage={tableActions.handlePageChange}
      setPageSize={tableActions.handlePageSizeChange}
    />
  );
};

export default DebtHistoryList;

