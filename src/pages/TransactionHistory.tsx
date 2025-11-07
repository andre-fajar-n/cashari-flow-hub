import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { Plus, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useCategories } from "@/hooks/queries/use-categories";
import { CommonItem } from "@/components/ui/transaction-items";
import TransactionDialog from "@/components/transactions/TransactionDialog";
import TransferDialog from "@/components/transfers/TransferDialog";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import DebtHistoryDialog from "@/components/debt/DebtHistoryDialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useDeleteTransaction, useTransactions } from "@/hooks/queries/use-transactions";
import { useDeleteTransfer, useTransfers } from "@/hooks/queries/use-transfers";
import { useDeleteGoalTransfer, useGoalTransfers } from "@/hooks/queries/use-goal-transfers";
import { useDeleteGoalInvestmentRecord, useGoalInvestmentRecords } from "@/hooks/queries/use-goal-investment-records";
import { useDebtHistories, useDeleteDebtHistory } from "@/hooks/queries/use-debt-histories";
import { TransactionModel } from "@/models/transactions";
import { TransferModel } from "@/models/transfer";
import { GoalTransferModel } from "@/models/goal-transfers";
import { GoalInvestmentRecordModel } from "@/models/goal-investment-records";
import { DebtHistoryModel } from "@/models/debt-histories";
import { MoneyMovementModel } from "@/models/money-movements";
import { MOVEMENT_TYPES } from "@/constants/enums";
import { useMoneyMovementsPaginated } from "@/hooks/queries/paginated/use-money-movements-paginated";

const TransactionHistory = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [serverSearch, setServerSearch] = useState("");
  const [serverFilters, setServerFilters] = useState<Record<string, any>>({});
  const itemsPerPage = 10;

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

  const { data: paged, isLoading: isMovementsLoading } = useMoneyMovementsPaginated({ page, itemsPerPage, searchTerm: serverSearch, filters: serverFilters });
  const movements = paged?.data || [];

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
  }, {} as Record<number, GoalTransferModel>);

  const investmentRecordIds = movements?.filter(m => m.resource_type === MOVEMENT_TYPES.INVESTMENT_GROWTH).map(m => m.resource_id) || [];
  const { data: investmentRecords, isLoading: isInvestmentRecordsLoading } = useGoalInvestmentRecords({ ids: investmentRecordIds });
  const investmentRecordsGroupById = investmentRecords?.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<number, GoalInvestmentRecordModel>);

  const isLoading = isMovementsLoading || isDebtHistoriesLoading || isTransactionsLoading || isTransfersLoading || isGoalTransfersLoading ||
                    isInvestmentRecordsLoading;

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
      case MOVEMENT_TYPES.INVESTMENT_GROWTH:;
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
  const handleDelete = (item: MoneyMovementModel) => {
    setDeleteModal({ open: true, item });
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

  // Render item based on type
  const renderItem = (item: MoneyMovementModel) => {
    return (
      <CommonItem
        key={item.id}
        movement={item}
        onEdit={() => handleEdit(item)}
        onDelete={() => handleDelete(item)}
      />
    );
  };

  const { data: categories } = useCategories();
  const { data: wallets } = useWallets();

  // Column filters
  const columnFilters: ColumnFilter[] = [
    {
      field: "resource_type",
      label: "Tipe",
      type: "select",
      options: [
        { label: "Transaksi", value: "transactions" },
        { label: "Transfer", value: "transfers" },
        { label: "Transfer Goal", value: "goal_transfers" },
        { label: "Progres Investasi", value: "investment_growth" },
        { label: "Riwayat Hutang/Piutang", value: "debt_histories" },
      ]
    },
    {
      field: "walletId",
      label: "Dompet",
      type: "select",
      options: wallets?.map(wallet => ({
        label: wallet.name,
        value: wallet.id.toString()
      })) || []
    },
    {
      field: "categoryId",
      label: "Kategori",
      type: "select",
      options: categories?.map(category => ({
        label: category.name,
        value: category.id.toString()
      })) || []
    },
    {
      field: "date",
      label: "Tanggal",
      type: "daterange"
    }
  ];

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <DataTable
            data={movements}
            isLoading={isLoading}
            searchPlaceholder="Cari riwayat transaksi..."
            searchFields={["description", "amount"]}
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
            renderItem={renderItem}
            emptyStateMessage="Belum ada riwayat transaksi"
            title="Riwayat Transaksi"
            description="Semua riwayat transaksi, transfer, dan pergerakan dana dalam satu tempat"
            headerActions={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">
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
                    Transfer Goal
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
            }
          />

          {/* Dialogs */}
          <TransactionDialog
            open={transactionDialog.open}
            onOpenChange={(open) => setTransactionDialog({ open })}
            transaction={transactionDialog.transaction}
            onSuccess={handleSuccess}
          />

          <TransferDialog
            open={transferDialog.open}
            onOpenChange={(open) => setTransferDialog({ open })}
            transfer={transferDialog.transfer}
            onSuccess={handleSuccess}
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
            debtId={debtHistoryDialog.history?.id}
            history={debtHistoryDialog.history}
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
