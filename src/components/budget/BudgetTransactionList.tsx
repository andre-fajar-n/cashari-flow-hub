import { useDeleteBudgetItem } from "@/hooks/queries/use-budget-transactions";
import { BudgetModel } from "@/models/budgets";
import { useCategories } from "@/hooks/queries/use-categories";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useTableState } from "@/hooks/use-table-state";
import { SelectFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { TransactionHistoryTable } from "@/components/transactions/TransactionHistoryTable";
import { getTransactionHistoryColumns } from "@/components/transactions/TransactionHistoryColumns";
import { useMoneyMovementsPaginatedByBudget } from "@/hooks/queries/paginated/use-money-movements-paginated";
import { useState } from "react";
import { TransactionModel } from "@/models/transactions";
import { MOVEMENT_TYPES } from "@/constants/enums";
import { useDeleteTransaction, useTransactions } from "@/hooks/queries/use-transactions";
import { MoneyMovementModel } from "@/models/money-movements";
import TransactionDialog from "@/components/transactions/TransactionDialog";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmationModal from "@/components/ConfirmationModal";

interface BudgetTransactionListProps {
  budget: BudgetModel;
}

const BudgetTransactionList = ({ budget }: BudgetTransactionListProps) => {
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

  const removeTransactionFromBudget = useDeleteBudgetItem();
  const { mutateAsync: deleteTransaction } = useDeleteTransaction();

  const { data: paged, isLoading: isLoadingMovements } = useMoneyMovementsPaginatedByBudget(budget.id, {
    page: tableState.page,
    itemsPerPage: tableState.pageSize,
    searchTerm: tableState.searchTerm,
    filters: tableState.filters
  });

  const { data: categories } = useCategories();
  const { data: wallets } = useWallets();

  const movements = paged?.data || [];
  const totalCount = paged?.count || 0;

  const transactionIds = movements?.filter(m => m.resource_type === MOVEMENT_TYPES.TRANSACTION).map(m => m.resource_id) || [];
  const { data: transactions, isLoading: isTransactionsLoading } = useTransactions({ ids: transactionIds });
  const transactionsGroupById = transactions?.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<number, TransactionModel>);

  const isLoading = isLoadingMovements || isTransactionsLoading;

  const handleRemoveTransaction = (transactionId: number) => {
    removeTransactionFromBudget.mutateAsync({
      budgetId: budget.id,
      transactionId
    })
  };

  const handleEditTransaction = (transaction: MoneyMovementModel) => {
    setTransactionDialog({ open: true, transaction: transactionsGroupById[transaction.resource_id] });
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
    setTransactionDialog({ open: false });
  };

  const handleDeleteTransaction = (movement: MoneyMovementModel) => {
    setDeleteModal({ open: true, item: movement });
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

  // Generate columns with remove from budget action
  const columns = getTransactionHistoryColumns({
    onEdit: handleEditTransaction,
    onDelete: handleDeleteTransaction,
    onRemoveFromBudget: handleRemoveTransaction,
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
    <>
      <TransactionHistoryTable
        columns={columns}
        data={movements}
        totalCount={totalCount}
        isLoading={isLoading}
        searchTerm={tableState.searchTerm}
        onSearchChange={tableActions.setSearchTerm}
        filters={tableState.filters}
        onFiltersChange={tableActions.setFilters}
        selectFilters={selectFilters}
        dateRangeFilter={dateRangeFilter}
        page={tableState.page}
        pageSize={tableState.pageSize}
        setPage={tableActions.setPage}
        setPageSize={tableActions.setPageSize}
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
    </>
  );
};

export default BudgetTransactionList;
