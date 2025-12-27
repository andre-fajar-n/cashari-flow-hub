import { useDeleteBudgetItem } from "@/hooks/queries/use-budget-transactions";
import { BudgetModel } from "@/models/budgets";
import { useTransactionCategories } from "@/hooks/queries/use-categories";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useTableState } from "@/hooks/use-table-state";
import { SelectFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { TransactionHistoryTable } from "@/components/transactions/TransactionHistoryTable";
import { getTransactionHistoryColumns } from "@/components/transactions/TransactionHistoryColumns";
import { useMoneyMovementsPaginatedByBudget } from "@/hooks/queries/paginated/use-money-movements-paginated";
import { TransactionModel } from "@/models/transactions";
import { MOVEMENT_TYPES } from "@/constants/enums";
import { useDeleteTransaction, useTransactions } from "@/hooks/queries/use-transactions";
import { MoneyMovementModel } from "@/models/money-movements";
import TransactionDialog from "@/components/transactions/TransactionDialog";
import { useQueryClient } from "@tanstack/react-query";
import { DeleteConfirmationModal, useDeleteConfirmation } from "@/components/DeleteConfirmationModal";
import { useForm } from "react-hook-form";
import { defaultTransactionFormValues, TransactionFormData, mapTransactionToFormData } from "@/form-dto/transactions";
import { useInsertTransactionWithRelations, useUpdateTransactionWithRelations } from "@/hooks/queries/use-transaction-with-relations";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useDialogState } from "@/hooks/use-dialog-state";

interface BudgetTransactionListProps {
  budget: BudgetModel;
}

const BudgetTransactionList = ({ budget }: BudgetTransactionListProps) => {
  const queryClient = useQueryClient();
  // Delete confirmation hook
  const deleteConfirmation = useDeleteConfirmation<MoneyMovementModel>({
    title: "Hapus Transaksi",
    description: "Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.",
  });

  // Table state management using generic hook
  const { state: tableState, actions: tableActions } = useTableState({
    initialPage: 1,
    initialPageSize: 10,
  });

  const removeTransactionFromBudget = useDeleteBudgetItem();
  const { mutateAsync: deleteTransaction } = useDeleteTransaction();
  const insertTransactionWithRelations = useInsertTransactionWithRelations();
  const updateTransactionWithRelations = useUpdateTransactionWithRelations();

  const { data: paged, isLoading: isLoadingMovements } = useMoneyMovementsPaginatedByBudget(budget.id, {
    page: tableState.page,
    itemsPerPage: tableState.pageSize,
    searchTerm: tableState.searchTerm,
    filters: tableState.filters
  });

  const { data: categories } = useTransactionCategories();
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

  // Form state managed at list level
  const form = useForm<TransactionFormData>({
    defaultValues: defaultTransactionFormValues,
  });

  // Dialog state using hook
  const transactionDialog = useDialogState<TransactionModel, TransactionFormData>({
    form,
    defaultValues: defaultTransactionFormValues,
    mapDataToForm: mapTransactionToFormData,
  });

  // Mutation callbacks
  const { handleSuccess: mutationSuccess, handleError } = useMutationCallbacks({
    setIsLoading: transactionDialog.setIsLoading,
    onOpenChange: (open) => !open && transactionDialog.close(),
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.TRANSACTIONS
  });

  const handleFormSubmit = (data: TransactionFormData) => {
    transactionDialog.setIsLoading(true);
    const processedData = {
      ...data,
      category_id: data.category_id || "",
      wallet_id: data.wallet_id || "",
    };

    if (transactionDialog.selectedData) {
      updateTransactionWithRelations.mutate({ id: transactionDialog.selectedData.id, ...processedData }, {
        onSuccess: mutationSuccess,
        onError: handleError
      });
    } else {
      insertTransactionWithRelations.mutate(processedData, {
        onSuccess: mutationSuccess,
        onError: handleError
      });
    }
  };

  const handleRemoveTransaction = (transactionId: number) => {
    removeTransactionFromBudget.mutateAsync({
      budgetId: budget.id,
      transactionId
    })
  };

  const handleEditTransaction = (movement: MoneyMovementModel) => {
    const transaction = transactionsGroupById[movement.resource_id];
    if (transaction) {
      transactionDialog.openEdit(transaction);
    }
  };

  const handleDeleteTransaction = (movement: MoneyMovementModel) => {
    deleteConfirmation.openModal(movement);
  };

  const handleConfirmDelete = (item: MoneyMovementModel) => {
    try {
      deleteTransaction(item.resource_id);
      queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    } catch (error) {
      console.error("Failed to delete transaction", error);
    }
  };

  // Generate columns with remove from budget action
  const columns = getTransactionHistoryColumns({
    onEdit: handleEditTransaction,
    onDelete: handleDeleteTransaction,
    onRemoveFromBudget: handleRemoveTransaction,
    hideResourceType: true
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
        onOpenChange={(open) => !open && transactionDialog.close()}
        form={form}
        isLoading={transactionDialog.isLoading}
        onSubmit={handleFormSubmit}
        transaction={transactionDialog.selectedData}
      />

      <DeleteConfirmationModal
        deleteConfirmation={deleteConfirmation}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default BudgetTransactionList;
