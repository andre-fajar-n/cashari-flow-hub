import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBusinessProjectTransactions } from "@/hooks/queries/use-business-project-transactions";
import { useMoneyMovementsPaginatedByProject } from "@/hooks/queries/paginated/use-money-movements-paginated";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import { BusinessProjectModel } from "@/models/business-projects";
import { useCategories } from "@/hooks/queries/use-categories";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useTableState } from "@/hooks/use-table-state";
import { SelectFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { TransactionHistoryTable } from "@/components/transactions/TransactionHistoryTable";
import { getTransactionHistoryColumns } from "@/components/transactions/TransactionHistoryColumns";
import TransactionDialog from "@/components/transactions/TransactionDialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import { TransactionModel } from "@/models/transactions";
import { MoneyMovementModel } from "@/models/money-movements";
import { useState } from "react";
import { MOVEMENT_TYPES } from "@/constants/enums";
import { useDeleteTransaction, useTransactions } from "@/hooks/queries/use-transactions";
import { useQueryClient } from "@tanstack/react-query";

interface BusinessProjectTransactionListProps {
  project: BusinessProjectModel;
}

const BusinessProjectTransactionList = ({ project }: BusinessProjectTransactionListProps) => {
  const queryClient = useQueryClient();
  const [transactionDialog, setTransactionDialog] = useState<{
    open: boolean;
    transaction?: TransactionModel;
  }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    item?: MoneyMovementModel;
  }>({ open: false });

  // Table state management using generic hook
  const { state: tableState, actions: tableActions } = useTableState({
    initialPage: 1,
    initialPageSize: 10,
  });

  const {
    data: projectTransactions,
    removeTransactionFromProject
  } = useBusinessProjectTransactions(project.id);
  const { mutateAsync: deleteTransaction } = useDeleteTransaction();

  const { data: paged, isLoading: isLoadingMovements } = useMoneyMovementsPaginatedByProject(project.id, {
    page: tableState.page,
    itemsPerPage: tableState.pageSize,
    searchTerm: tableState.searchTerm,
    filters: tableState.filters
  });

  const movements = paged?.data || [];
  const totalCount = paged?.count || 0;

  const transactionIds = movements?.filter(m => m.resource_type === MOVEMENT_TYPES.TRANSACTION).map(m => m.resource_id) || [];
  const { data: transactions, isLoading: isTransactionsLoading } = useTransactions({ ids: transactionIds });
  const transactionsGroupById = transactions?.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<number, TransactionModel>);

  const isLoading = isLoadingMovements || isTransactionsLoading;

  const { data: categories } = useCategories();
  const { data: wallets } = useWallets();

  const handleRemoveTransaction = (transactionId: number) => {
    removeTransactionFromProject.mutate({
      projectId: project.id,
      transactionId
    });
  };

  const handleEditTransaction = (transaction: MoneyMovementModel) => {
    setTransactionDialog({ open: true, transaction: transactionsGroupById[transaction.resource_id] });
  };

  const handleDeleteTransaction = (movement: MoneyMovementModel) => {
    setDeleteModal({ open: true, item: movement });
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
    setTransactionDialog({ open: false });
  };

  const handleConfirmDelete = () => {
    if (!deleteModal.item) return;

    try {
      deleteTransaction(deleteModal.item.resource_id);
      queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    } catch (error) {
      console.error("Failed to delete transaction", error);
    } finally {
      setDeleteModal({ open: false });
    }
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

  // Generate columns with remove from project action
  const columns = getTransactionHistoryColumns({
    onEdit: handleEditTransaction,
    onDelete: handleDeleteTransaction,
    onRemoveFromProject: handleRemoveTransaction, // Reuse for "Remove from Project"
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

  const dateRangeFilter = {
    key: "date",
    label: "Tanggal",
    placeholder: "Pilih rentang tanggal",
  };

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

      <TransactionDialog
        open={transactionDialog.open}
        onOpenChange={(open) => setTransactionDialog({ open })}
        transaction={transactionDialog.transaction}
        onSuccess={handleSuccess}
      />

      <ConfirmationModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open })}
        onConfirm={handleConfirmDelete}
        title="Hapus Item"
        description={`Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="destructive"
      />
    </div>
  );
};

export default BusinessProjectTransactionList;
