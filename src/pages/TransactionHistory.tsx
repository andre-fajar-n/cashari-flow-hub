import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TransactionDialog from "@/components/transactions/TransactionDialog";
import TransferDialog from "@/components/transfers/TransferDialog";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import DebtHistoryDialog from "@/components/debt/DebtHistoryDialog";
import { DeleteConfirmationModal, useDeleteConfirmation } from "@/components/DeleteConfirmationModal";
import { useDeleteTransaction, useTransactions } from "@/hooks/queries/use-transactions";
import { useDeleteTransfer, useTransfers, useCreateTransfer, useUpdateTransfer } from "@/hooks/queries/use-transfers";
import { useCreateGoalTransfer, useDeleteGoalTransfer, useGoalTransfers, useUpdateGoalTransfer } from "@/hooks/queries/use-goal-transfers";
import { useCreateGoalInvestmentRecord, useDeleteGoalInvestmentRecord, useGoalInvestmentRecords, useUpdateGoalInvestmentRecord } from "@/hooks/queries/use-goal-investment-records";
import { useCreateDebtHistory, useDebtHistories, useDeleteDebtHistory, useUpdateDebtHistory } from "@/hooks/queries/use-debt-histories";
import { useWallets } from "@/hooks/queries/use-wallets";
import { TransactionModel } from "@/models/transactions";
import { TransferModel } from "@/models/transfer";
import { GoalTransferModel, GoalTransferWithRelations } from "@/models/goal-transfers";
import { GoalInvestmentRecordModel, GoalInvestmentRecordWithRelations } from "@/models/goal-investment-records";
import { DebtHistoryModel } from "@/models/debt-histories";
import { MoneyMovementModel } from "@/models/money-movements";
import { CATEGORY_APPLICATIONS, MOVEMENT_TYPES } from "@/constants/enums";
import { useMoneyMovementsPaginated } from "@/hooks/queries/paginated/use-money-movements-paginated";
import { useTableState } from "@/hooks/use-table-state";
import { TransactionHistoryTable } from "@/components/transactions/TransactionHistoryTable";
import { getTransactionHistoryColumns } from "@/components/transactions/TransactionHistoryColumns";
import { useBudgets, useBusinessProjects, useCategories, useDebtCategories, useDebts, useGoals, useInvestmentAssets, useInvestmentCategories, useInvestmentInstruments } from "@/hooks/queries";
import { defaultTransactionFormValues, mapTransactionToFormData, TransactionFormData } from "@/form-dto/transactions";
import { defaultTransferFormData, mapTransferToFormData, TransferFormData } from "@/form-dto/transfer";
import { defaultGoalTransferFormData, GoalTransferFormData, mapGoalTransferToFormData } from "@/form-dto/goal-transfers";
import { defaultGoalInvestmentRecordFormData, GoalInvestmentRecordFormData, mapGoalInvestmentRecordToFormData } from "@/form-dto/goal-investment-records";
import { defaultDebtHistoryFormValues, DebtHistoryFormData, mapDebtHistoryToFormData } from "@/form-dto/debt-histories";
import { useInsertTransactionWithRelations, useUpdateTransactionWithRelations } from "@/hooks/queries/use-transaction-with-relations";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useAuth } from "@/hooks/use-auth";
import { useDialogState } from "@/hooks/use-dialog-state";

const TransactionHistory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Table state management using generic hook
  const { state: tableState, actions: tableActions } = useTableState({
    initialPage: 1,
    initialPageSize: 10,
  });

  // Form states
  const transactionForm = useForm<TransactionFormData>({
    defaultValues: defaultTransactionFormValues,
  });

  const transferForm = useForm<TransferFormData>({
    defaultValues: defaultTransferFormData,
  });

  const goalTransferForm = useForm<GoalTransferFormData>({
    defaultValues: defaultGoalTransferFormData,
  });

  const investmentRecordForm = useForm<GoalInvestmentRecordFormData>({
    defaultValues: defaultGoalInvestmentRecordFormData,
  });

  const debtHistoryForm = useForm<DebtHistoryFormData>({
    defaultValues: defaultDebtHistoryFormValues,
  });

  // Dialog states using useDialogState
  const transactionDialog = useDialogState<TransactionModel, TransactionFormData>({
    form: transactionForm,
    defaultValues: defaultTransactionFormValues,
    mapDataToForm: mapTransactionToFormData,
  });

  const transferDialog = useDialogState<TransferModel, TransferFormData>({
    form: transferForm,
    defaultValues: defaultTransferFormData,
    mapDataToForm: mapTransferToFormData,
  });

  const goalTransferDialog = useDialogState<GoalTransferModel, GoalTransferFormData>({
    form: goalTransferForm,
    defaultValues: defaultGoalTransferFormData,
    mapDataToForm: mapGoalTransferToFormData,
  });

  const investmentDialog = useDialogState<GoalInvestmentRecordModel, GoalInvestmentRecordFormData>({
    form: investmentRecordForm,
    defaultValues: defaultGoalInvestmentRecordFormData,
    mapDataToForm: mapGoalInvestmentRecordToFormData,
  });

  const debtHistoryDialog = useDialogState<DebtHistoryModel, DebtHistoryFormData>({
    form: debtHistoryForm,
    defaultValues: defaultDebtHistoryFormValues,
    mapDataToForm: mapDebtHistoryToFormData,
  });

  // Delete confirmation using reusable hook
  const deleteConfirmation = useDeleteConfirmation<MoneyMovementModel>({
    title: "Hapus Item",
    description: "Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.",
  });

  const { data: paged, isLoading: isMovementsLoading } = useMoneyMovementsPaginated({
    page: tableState.page,
    itemsPerPage: tableState.pageSize,
    searchTerm: tableState.searchTerm,
    filters: tableState.filters,
  });
  const movements = paged?.data || [];
  const totalCount = paged?.count || 0;

  const debtHistoryIds = movements?.filter(m => m.resource_type === MOVEMENT_TYPES.DEBT_HISTORY).map(m => m.resource_id) || [];
  const { data: debtHistories, isLoading: isDebtHistoriesLoading } = useDebtHistories({ ids: debtHistoryIds });
  const debtHistoriesGroupById = debtHistories?.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<number, DebtHistoryModel>);

  const transactionIds = movements?.filter(m => m.resource_type === MOVEMENT_TYPES.TRANSACTION).map(m => m.resource_id) || [];
  const { data: transactions, isLoading: isTransactionsLoading } = useTransactions({ ids: transactionIds });
  const transactionsGroupById = transactions?.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<number, TransactionModel>);

  const transferIds = movements?.filter(m => m.resource_type === MOVEMENT_TYPES.TRANSFER).map(m => m.resource_id) || [];
  const { data: transfers, isLoading: isTransfersLoading } = useTransfers({ ids: transferIds });
  const transfersGroupById = transfers?.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<number, TransferModel>);

  const goalTransferIds = movements?.filter(m => m.resource_type === MOVEMENT_TYPES.GOAL_TRANSFER).map(m => m.resource_id) || [];
  const { data: goalTransfers, isLoading: isGoalTransfersLoading } = useGoalTransfers({ ids: goalTransferIds });
  const goalTransfersGroupById = goalTransfers?.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<number, GoalTransferWithRelations>);

  const investmentRecordIds = movements?.filter(m => m.resource_type === MOVEMENT_TYPES.INVESTMENT_GROWTH).map(m => m.resource_id) || [];
  const { data: investmentRecords, isLoading: isInvestmentRecordsLoading } = useGoalInvestmentRecords({ ids: investmentRecordIds });
  const investmentRecordsGroupById = investmentRecords?.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<number, GoalInvestmentRecordWithRelations>);

  const isLoading = isMovementsLoading || isDebtHistoriesLoading || isTransactionsLoading || isTransfersLoading || isGoalTransfersLoading ||
    isInvestmentRecordsLoading;

  const { data: wallets } = useWallets();

  // Mutations
  const insertTransactionWithRelations = useInsertTransactionWithRelations();
  const updateTransactionWithRelations = useUpdateTransactionWithRelations();
  const createTransfer = useCreateTransfer();
  const updateTransfer = useUpdateTransfer();

  // Transaction mutation callbacks
  const { handleSuccess: handleTransactionSuccess, handleError: handleTransactionError } = useMutationCallbacks({
    setIsLoading: transactionDialog.setIsLoading,
    onOpenChange: (open) => !open && transactionDialog.close(),
    form: transactionForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.TRANSACTIONS
  });

  // Transfer mutation callbacks
  const { handleSuccess: handleTransferSuccess, handleError: handleTransferError } = useMutationCallbacks({
    setIsLoading: transferDialog.setIsLoading,
    onOpenChange: (open) => !open && transferDialog.close(),
    form: transferForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.TRANSFERS
  });

  // Goal transfer mutation callbacks
  const { handleSuccess: handleGoalTransferSuccess, handleError: handleGoalTransferError } = useMutationCallbacks({
    setIsLoading: goalTransferDialog.setIsLoading,
    onOpenChange: (open) => !open && goalTransferDialog.close(),
    form: goalTransferForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.GOAL_TRANSFERS
  });

  // Investment record mutation callbacks
  const { handleSuccess: handleInvestmentSuccess, handleError: handleInvestmentError } = useMutationCallbacks({
    setIsLoading: investmentDialog.setIsLoading,
    onOpenChange: (open) => !open && investmentDialog.close(),
    form: investmentRecordForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.INVESTMENT_RECORDS
  });

  // Debt history mutation callbacks
  const { handleSuccess: handleDebtHistorySuccess, handleError: handleDebtHistoryError } = useMutationCallbacks({
    setIsLoading: debtHistoryDialog.setIsLoading,
    onOpenChange: (open) => !open && debtHistoryDialog.close(),
    form: debtHistoryForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.DEBTS
  });

  // Additional mutations
  const createGoalTransfer = useCreateGoalTransfer();
  const updateGoalTransfer = useUpdateGoalTransfer();
  const createInvestmentRecord = useCreateGoalInvestmentRecord();
  const updateInvestmentRecord = useUpdateGoalInvestmentRecord();
  const createDebtHistory = useCreateDebtHistory();
  const updateDebtHistory = useUpdateDebtHistory();

  const handleTransactionFormSubmit = (data: TransactionFormData) => {
    transactionDialog.setIsLoading(true);
    const processedData = {
      ...data,
      category_id: data.category_id || "",
      wallet_id: data.wallet_id || "",
    };

    if (transactionDialog.selectedData) {
      updateTransactionWithRelations.mutate({ id: transactionDialog.selectedData.id, ...processedData }, {
        onSuccess: handleTransactionSuccess,
        onError: handleTransactionError
      });
    } else {
      insertTransactionWithRelations.mutate(processedData, {
        onSuccess: handleTransactionSuccess,
        onError: handleTransactionError
      });
    }
  };

  const handleTransferFormSubmit = (data: TransferFormData) => {
    if (!user) return;
    transferDialog.setIsLoading(true);

    const fromWallet = wallets?.find(w => w.id.toString() === data.from_wallet_id);
    const toWallet = wallets?.find(w => w.id.toString() === data.to_wallet_id);
    const isSameCurrency = fromWallet?.currency_code === toWallet?.currency_code;

    const transferData = {
      from_wallet_id: parseInt(data.from_wallet_id || "0"),
      to_wallet_id: parseInt(data.to_wallet_id || "0"),
      from_amount: data.from_amount,
      to_amount: isSameCurrency ? data.from_amount : data.to_amount,
      date: data.date,
    };

    if (transferDialog.selectedData) {
      updateTransfer.mutate({ id: transferDialog.selectedData.id, ...transferData }, {
        onSuccess: handleTransferSuccess,
        onError: handleTransferError
      });
    } else {
      createTransfer.mutate(transferData, {
        onSuccess: handleTransferSuccess,
        onError: handleTransferError
      });
    }
  };

  const handleGoalTransferFormSubmit = (data: GoalTransferFormData) => {
    if (!user) return;
    goalTransferDialog.setIsLoading(true);

    const submitData = { ...data, user_id: user.id };

    if (goalTransferDialog.selectedData) {
      updateGoalTransfer.mutate({ id: goalTransferDialog.selectedData.id, ...submitData }, {
        onSuccess: handleGoalTransferSuccess,
        onError: handleGoalTransferError
      });
    } else {
      createGoalTransfer.mutate(submitData, {
        onSuccess: handleGoalTransferSuccess,
        onError: handleGoalTransferError
      });
    }
  };

  const handleInvestmentFormSubmit = (data: GoalInvestmentRecordFormData) => {
    if (!user) return;
    investmentDialog.setIsLoading(true);

    const submitData = { ...data, user_id: user.id };

    if (investmentDialog.selectedData) {
      updateInvestmentRecord.mutate({ id: investmentDialog.selectedData.id, ...submitData }, {
        onSuccess: handleInvestmentSuccess,
        onError: handleInvestmentError
      });
    } else {
      createInvestmentRecord.mutate(submitData, {
        onSuccess: handleInvestmentSuccess,
        onError: handleInvestmentError
      });
    }
  };

  const handleDebtHistoryFormSubmit = (data: DebtHistoryFormData) => {
    if (!user) return;
    debtHistoryDialog.setIsLoading(true);

    const submitData = {
      debt_id: parseInt(data.debt_id),
      wallet_id: parseInt(data.wallet_id),
      category_id: parseInt(data.category_id),
      amount: data.amount,
      date: data.date,
      description: data.description || "",
      user_id: user.id,
    };

    if (debtHistoryDialog.selectedData) {
      updateDebtHistory.mutate({ id: debtHistoryDialog.selectedData.id, ...submitData }, {
        onSuccess: handleDebtHistorySuccess,
        onError: handleDebtHistoryError
      });
    } else {
      createDebtHistory.mutate(submitData, {
        onSuccess: handleDebtHistorySuccess,
        onError: handleDebtHistoryError
      });
    }
  };

  // Handle edit actions
  const handleEdit = (item: MoneyMovementModel) => {
    switch (item.resource_type) {
      case MOVEMENT_TYPES.TRANSACTION:
        transactionDialog.openEdit(transactionsGroupById[item.resource_id]);
        break;
      case MOVEMENT_TYPES.TRANSFER:
        transferDialog.openEdit(transfersGroupById[item.resource_id]);
        break;
      case MOVEMENT_TYPES.GOAL_TRANSFER:
        goalTransferDialog.openEdit(goalTransfersGroupById[item.resource_id]);
        break;
      case MOVEMENT_TYPES.INVESTMENT_GROWTH:
        investmentDialog.openEdit(investmentRecordsGroupById[item.resource_id]);
        break;
      case MOVEMENT_TYPES.DEBT_HISTORY:
        debtHistoryDialog.openEdit(debtHistoriesGroupById[item.resource_id]);
        break;
    }
  };

  // Delete mutations
  const { mutateAsync: deleteTransaction } = useDeleteTransaction();
  const { mutateAsync: deleteTransfer } = useDeleteTransfer();
  const { mutateAsync: deleteGoalTransfer } = useDeleteGoalTransfer();
  const { mutateAsync: deleteInvestmentRecord } = useDeleteGoalInvestmentRecord();
  const { mutateAsync: deleteDebtHistory } = useDeleteDebtHistory();

  // Handle delete actions
  const handleDelete = (movement: MoneyMovementModel) => {
    deleteConfirmation.openModal(movement);
  };

  const handleConfirmDelete = async (item: MoneyMovementModel) => {
    const itemId = item.resource_id;

    try {
      switch (item.resource_type) {
        case MOVEMENT_TYPES.TRANSACTION:
          await deleteTransaction(itemId);
          break;
        case MOVEMENT_TYPES.TRANSFER:
          await deleteTransfer(itemId);
          break;
        case MOVEMENT_TYPES.GOAL_TRANSFER:
          await deleteGoalTransfer(itemId);
          break;
        case MOVEMENT_TYPES.INVESTMENT_GROWTH:
          await deleteInvestmentRecord(itemId);
          break;
        case MOVEMENT_TYPES.DEBT_HISTORY:
          await deleteDebtHistory(itemId);
          break;
      }

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  // Handle add new actions
  const handleAddNew = (type: string) => {
    switch (type) {
      case MOVEMENT_TYPES.TRANSACTION:
        transactionDialog.openAdd();
        break;
      case MOVEMENT_TYPES.TRANSFER:
        transferDialog.openAdd();
        break;
      case MOVEMENT_TYPES.GOAL_TRANSFER:
        goalTransferDialog.openAdd();
        break;
      case MOVEMENT_TYPES.INVESTMENT_GROWTH:
        investmentDialog.openAdd();
        break;
      case MOVEMENT_TYPES.DEBT_HISTORY:
        debtHistoryDialog.openAdd();
        break;
    }
  };

  const { data: categories } = useCategories();
  const { data: categoriesInvestment } = useInvestmentCategories();
  const { data: categoriesDebt } = useDebtCategories();
  const { data: goals } = useGoals();
  const { data: instruments } = useInvestmentInstruments();
  const { data: assets } = useInvestmentAssets();
  const { data: debts } = useDebts();
  const { data: businessProjects } = useBusinessProjects();
  const { data: budgets } = useBudgets();

  // Generate columns using separated column definitions
  const columns = getTransactionHistoryColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  // Select filters configuration
  // Order matters: first filters will be shown as primary (first 5 if total > 6)
  // All filters now have fixed width (200px) set in the component
  const selectFilters = [
    {
      key: "resource_type",
      label: "Tipe",
      options: [
        { label: "Transaksi", value: "transactions" },
        { label: "Transfer", value: "transfers" },
        { label: "Transfer Target", value: "goal_transfers" },
        { label: "Progres Investasi", value: "investment_growth" },
        { label: "Hutang/Piutang", value: "debt_histories" },
      ],
    },
    {
      key: "wallet_id",
      label: "Dompet",
      options:
        wallets?.map((wallet) => ({
          label: wallet.name,
          value: wallet.id.toString(),
        })) || [],
    },
    {
      key: "category_id",
      label: "Kategori",
      options:
        categories?.map((category) => ({
          label: category.name,
          value: category.id.toString(),
        })) || [],
    },
    {
      key: "goal_id",
      label: "Target",
      options:
        goals?.map((goal) => ({
          label: goal.name,
          value: goal.id.toString(),
        })) || [],
    },
    {
      key: "instrument_id",
      label: "Instrumen",
      options:
        instruments?.map((instrument) => ({
          label: instrument.name,
          value: instrument.id.toString(),
        })) || [],
    },
    {
      key: "asset_id",
      label: "Aset",
      options:
        assets?.map((asset) => ({
          label: asset.name,
          value: asset.id.toString(),
        })) || [],
    },
    {
      key: "budget_id",
      label: "Budget",
      options:
        budgets?.map((budget) => ({
          label: budget.name,
          value: budget.id.toString(),
        })) || [],
    },
    {
      key: "project_id",
      label: "Proyek",
      options:
        businessProjects?.map((project) => ({
          label: project.name,
          value: project.id.toString(),
        })) || [],
    },
    {
      key: "debt_id",
      label: "Hutang/Piutang",
      options:
        debts?.map((debt) => ({
          label: debt.name,
          value: debt.id.toString(),
        })) || [],
    },
  ];

  // Date range filter configuration
  // Fixed width (200px) set in the component
  const dateRangeFilter = {
    key: "date",
    label: "Tanggal",
    placeholder: "Pilih rentang tanggal",
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
              <p className="text-sm text-gray-600 mt-1">
                Semua riwayat transaksi, transfer, dan pergerakan dana dalam satu tempat
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Baru
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleAddNew(MOVEMENT_TYPES.TRANSACTION)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Transaksi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddNew(MOVEMENT_TYPES.TRANSFER)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Transfer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddNew(MOVEMENT_TYPES.GOAL_TRANSFER)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Transfer Target
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddNew(MOVEMENT_TYPES.INVESTMENT_GROWTH)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Progres Investasi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddNew(MOVEMENT_TYPES.DEBT_HISTORY)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Hutang/Piutang
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Transaction History Table */}
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

          {/* Dialogs */}
          <TransactionDialog
            open={transactionDialog.open}
            onOpenChange={(open) => !open && transactionDialog.close()}
            form={transactionForm}
            isLoading={transactionDialog.isLoading}
            onSubmit={handleTransactionFormSubmit}
            transaction={transactionDialog.selectedData}
          />

          <TransferDialog
            open={transferDialog.open}
            onOpenChange={(open) => !open && transferDialog.close()}
            form={transferForm}
            isLoading={transferDialog.isLoading}
            onSubmit={handleTransferFormSubmit}
            wallets={wallets}
            transfer={transferDialog.selectedData}
          />

          <GoalTransferDialog
            open={goalTransferDialog.open}
            onOpenChange={(open) => !open && goalTransferDialog.close()}
            form={goalTransferForm}
            isLoading={goalTransferDialog.isLoading}
            onSubmit={handleGoalTransferFormSubmit}
            transfer={goalTransferDialog.selectedData}
            wallets={wallets}
            goals={goals}
            instruments={instruments}
            assets={assets}
          />

          <GoalInvestmentRecordDialog
            open={investmentDialog.open}
            onOpenChange={(open) => !open && investmentDialog.close()}
            form={investmentRecordForm}
            isLoading={investmentDialog.isLoading}
            onSubmit={handleInvestmentFormSubmit}
            record={investmentDialog.selectedData}
            goals={goals}
            instruments={instruments}
            assets={assets}
            wallets={wallets}
            categories={categoriesInvestment}
          />

          <DebtHistoryDialog
            open={debtHistoryDialog.open}
            onOpenChange={(open) => !open && debtHistoryDialog.close()}
            form={debtHistoryForm}
            isLoading={debtHistoryDialog.isLoading}
            onSubmit={handleDebtHistoryFormSubmit}
            history={debtHistoryDialog.selectedData}
            showDebtSelection={true}
            wallets={wallets}
            categories={categoriesDebt}
            debts={debts}
          />

          <DeleteConfirmationModal
            deleteConfirmation={deleteConfirmation}
            onConfirm={handleConfirmDelete}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default TransactionHistory;
