import { useState, useEffect } from "react";
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
import ConfirmationModal from "@/components/ConfirmationModal";
import { useDeleteTransaction, useTransactions } from "@/hooks/queries/use-transactions";
import { useDeleteTransfer, useTransfers, useCreateTransfer, useUpdateTransfer } from "@/hooks/queries/use-transfers";
import { useDeleteGoalTransfer, useGoalTransfers } from "@/hooks/queries/use-goal-transfers";
import { useDeleteGoalInvestmentRecord, useGoalInvestmentRecords } from "@/hooks/queries/use-goal-investment-records";
import { useDebtHistories, useDeleteDebtHistory } from "@/hooks/queries/use-debt-histories";
import { useWallets } from "@/hooks/queries/use-wallets";
import { TransactionModel } from "@/models/transactions";
import { TransferModel } from "@/models/transfer";
import { GoalTransferModel, GoalTransferWithRelations } from "@/models/goal-transfers";
import { GoalInvestmentRecordModel, GoalInvestmentRecordWithRelations } from "@/models/goal-investment-records";
import { DebtHistoryModel } from "@/models/debt-histories";
import { MoneyMovementModel } from "@/models/money-movements";
import { MOVEMENT_TYPES } from "@/constants/enums";
import { useMoneyMovementsPaginated } from "@/hooks/queries/paginated/use-money-movements-paginated";
import { useTableState } from "@/hooks/use-table-state";
import { TransactionHistoryTable } from "@/components/transactions/TransactionHistoryTable";
import { getTransactionHistoryColumns } from "@/components/transactions/TransactionHistoryColumns";
import { useBudgets, useBusinessProjects, useCategories, useDebts, useGoals, useInvestmentAssets, useInvestmentInstruments } from "@/hooks/queries";
import { defaultTransactionFormValues, TransactionFormData } from "@/form-dto/transactions";
import { defaultTransferFormData, TransferFormData } from "@/form-dto/transfer";
import { useInsertTransactionWithRelations, useUpdateTransactionWithRelations } from "@/hooks/queries/use-transaction-with-relations";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useAuth } from "@/hooks/use-auth";

const TransactionHistory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Table state management using generic hook
  const { state: tableState, actions: tableActions } = useTableState({
    initialPage: 1,
    initialPageSize: 10,
  });

  // Dialog states
  const [transactionDialog, setTransactionDialog] = useState<{
    open: boolean;
    transaction?: TransactionModel;
  }>({ open: false });

  const [transferDialog, setTransferDialog] = useState<{
    open: boolean;
    transfer?: TransferModel;
  }>({ open: false });

  const [goalTransferDialog, setGoalTransferDialog] = useState<{
    open: boolean;
    transfer?: GoalTransferModel;
  }>({ open: false });

  const [investmentDialog, setInvestmentDialog] = useState<{
    open: boolean;
    record?: GoalInvestmentRecordModel;
  }>({ open: false });

  const [debtHistoryDialog, setDebtHistoryDialog] = useState<{
    open: boolean;
    history?: DebtHistoryModel;
  }>({ open: false });

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    item?: MoneyMovementModel;
  }>({ open: false });

  // Form loading states
  const [isTransactionFormLoading, setIsTransactionFormLoading] = useState(false);
  const [isTransferFormLoading, setIsTransferFormLoading] = useState(false);

  // Form states
  const transactionForm = useForm<TransactionFormData>({
    defaultValues: defaultTransactionFormValues,
  });

  const transferForm = useForm<TransferFormData>({
    defaultValues: defaultTransferFormData,
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

  // Reset transaction form when dialog opens
  useEffect(() => {
    if (transactionDialog.open) {
      const transaction = transactionDialog.transaction;
      if (transaction) {
        const budgetIds = transaction.budget_items?.map((item) => item.budget_id) || [];
        const businessProjectIds = transaction.business_project_transactions?.map((item) => item.project_id) || [];
        transactionForm.reset({
          amount: transaction.amount || 0,
          category_id: transaction.category_id ? transaction.category_id.toString() : null,
          wallet_id: transaction.wallet_id ? transaction.wallet_id.toString() : null,
          date: transaction.date || new Date().toISOString().split("T")[0],
          description: transaction.description || "",
          budget_ids: budgetIds,
          business_project_ids: businessProjectIds,
        });
      } else {
        transactionForm.reset(defaultTransactionFormValues);
      }
    }
  }, [transactionDialog.open, transactionDialog.transaction, transactionForm]);

  // Reset transfer form when dialog opens
  useEffect(() => {
    if (transferDialog.open && wallets) {
      const transfer = transferDialog.transfer;
      if (transfer) {
        transferForm.reset({
          from_wallet_id: transfer.from_wallet_id?.toString() || null,
          to_wallet_id: transfer.to_wallet_id?.toString() || null,
          from_amount: transfer.from_amount || 0,
          to_amount: transfer.to_amount || 0,
          date: transfer.date || new Date().toISOString().split("T")[0],
        });
      } else {
        transferForm.reset(defaultTransferFormData);
      }
    }
  }, [transferDialog.open, transferDialog.transfer, transferForm, wallets]);

  // Transaction mutation callbacks
  const { handleSuccess: handleTransactionSuccess, handleError: handleTransactionError } = useMutationCallbacks({
    setIsLoading: setIsTransactionFormLoading,
    onOpenChange: (open) => setTransactionDialog({ open }),
    form: transactionForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.TRANSACTIONS
  });

  // Transfer mutation callbacks
  const { handleSuccess: handleTransferSuccess, handleError: handleTransferError } = useMutationCallbacks({
    setIsLoading: setIsTransferFormLoading,
    onOpenChange: (open) => setTransferDialog({ open }),
    form: transferForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.TRANSFERS
  });

  const handleTransactionFormSubmit = (data: TransactionFormData) => {
    setIsTransactionFormLoading(true);
    const processedData = {
      ...data,
      category_id: data.category_id || "",
      wallet_id: data.wallet_id || "",
    };

    if (transactionDialog.transaction) {
      updateTransactionWithRelations.mutate({ id: transactionDialog.transaction.id, ...processedData }, {
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
    setIsTransferFormLoading(true);

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

    if (transferDialog.transfer) {
      updateTransfer.mutate({ id: transferDialog.transfer.id, ...transferData }, {
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

  // Handle edit actions
  const handleEdit = (item: MoneyMovementModel) => {
    switch (item.resource_type) {
      case MOVEMENT_TYPES.TRANSACTION:
        setTransactionDialog({ open: true, transaction: transactionsGroupById[item.resource_id] });
        break;
      case MOVEMENT_TYPES.TRANSFER:
        setTransferDialog({ open: true, transfer: transfersGroupById[item.resource_id] });
        break;
      case MOVEMENT_TYPES.GOAL_TRANSFER:
        setGoalTransferDialog({ open: true, transfer: goalTransfersGroupById[item.resource_id] });
        break;
      case MOVEMENT_TYPES.INVESTMENT_GROWTH: ;
        setInvestmentDialog({
          open: true,
          record: investmentRecordsGroupById[item.resource_id],
        });
        break;
      case MOVEMENT_TYPES.DEBT_HISTORY:
        setDebtHistoryDialog({
          open: true,
          history: debtHistoriesGroupById[item.resource_id]
        });
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
    setDeleteModal({ open: true, item: movement });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.item) return;

    const item = deleteModal.item;
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
      setDeleteModal({ open: false });
      queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  // Handle add new actions
  const handleAddNew = (type: string) => {
    switch (type) {
      case MOVEMENT_TYPES.TRANSACTION:
        setTransactionDialog({ open: true });
        break;
      case MOVEMENT_TYPES.TRANSFER:
        setTransferDialog({ open: true });
        break;
      case MOVEMENT_TYPES.GOAL_TRANSFER:
        setGoalTransferDialog({ open: true });
        break;
      case MOVEMENT_TYPES.INVESTMENT_GROWTH:
        setInvestmentDialog({ open: true });
        break;
      case MOVEMENT_TYPES.DEBT_HISTORY:
        setDebtHistoryDialog({ open: true });
        break;
    }
  };

  const { data: categories } = useCategories();
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

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
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
            onOpenChange={(open) => setTransactionDialog({ open })}
            form={transactionForm}
            isLoading={isTransactionFormLoading}
            onSubmit={handleTransactionFormSubmit}
            transaction={transactionDialog.transaction}
          />

          <TransferDialog
            open={transferDialog.open}
            onOpenChange={(open) => setTransferDialog({ open })}
            form={transferForm}
            isLoading={isTransferFormLoading}
            onSubmit={handleTransferFormSubmit}
            wallets={wallets}
            transfer={transferDialog.transfer}
          />

          <GoalTransferDialog
            open={goalTransferDialog.open}
            onOpenChange={(open) => setGoalTransferDialog({ open })}
            transfer={goalTransferDialog.transfer}
            onSuccess={handleSuccess}
          />

          <GoalInvestmentRecordDialog
            open={investmentDialog.open}
            onOpenChange={(open) => setInvestmentDialog({ open })}
            record={investmentDialog.record}
            onSuccess={handleSuccess}
          />

          <DebtHistoryDialog
            open={debtHistoryDialog.open}
            onOpenChange={(open) => setDebtHistoryDialog({ open })}
            debtId={debtHistoryDialog.history?.debt_id}
            history={debtHistoryDialog.history}
            showDebtSelection={true}
            onSuccess={handleSuccess}
          />

          <ConfirmationModal
            open={deleteModal.open}
            onOpenChange={(open) => setDeleteModal({ open })}
            onConfirm={handleConfirmDelete}
            title="Hapus Item"
            description={`Apakah Anda yakin ingin menghapus ${deleteModal.item?.resource_type} ini? Tindakan ini tidak dapat dibatalkan.`}
            confirmText="Ya, Hapus"
            cancelText="Batal"
            variant="destructive"
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default TransactionHistory;
