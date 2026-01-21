import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Edit, Trash2, Plus, Minus, ArrowRightLeft, BarChart3, Power, PowerOff } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import GoalDialog from "@/components/goal/GoalDialog";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import GoalOverview from "@/components/goal/GoalOverview";
import GoalMovementList from "@/components/goal/GoalMovementList";
import PageLoading from "@/components/PageLoading";
import { GoalTransferConfig } from "@/components/goal/GoalTransferModes";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useMoneyMovementsPaginatedByGoal } from "@/hooks/queries/paginated/use-money-movements-paginated";
import { useDeleteGoal, useGoalDetail, useGoals, useUpdateGoal, useToggleGoalActive } from "@/hooks/queries/use-goals";
import { useGoalTransfers, useCreateGoalTransfer, useUpdateGoalTransfer, useDeleteGoalTransfer } from "@/hooks/queries/use-goal-transfers";
import { useGoalInvestmentRecords, useCreateGoalInvestmentRecord, useUpdateGoalInvestmentRecord, useDeleteGoalInvestmentRecord } from "@/hooks/queries/use-goal-investment-records";
import { useMoneySummary } from "@/hooks/queries/use-money-summary";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useInvestmentAssets } from "@/hooks/queries/use-investment-assets";
import { useInvestmentInstruments } from "@/hooks/queries/use-investment-instruments";
import { useCurrencies, useCurrencyDetail } from "@/hooks/queries/use-currencies";
import { useInvestmentCategories } from "@/hooks/queries/use-categories";
import { useTableState } from "@/hooks/use-table-state";
import { MOVEMENT_TYPES } from "@/constants/enums";
import { GoalFormData, defaultGoalFormValues, mapGoalToFormData } from "@/form-dto/goals";
import { GoalTransferFormData, defaultGoalTransferFormData, mapGoalTransferToFormData } from "@/form-dto/goal-transfers";
import { GoalTransferModel } from "@/models/goal-transfers";
import { GoalInvestmentRecordModel } from "@/models/goal-investment-records";
import { GoalInvestmentRecordFormData, defaultGoalInvestmentRecordFormData, mapGoalInvestmentRecordToFormData } from "@/form-dto/goal-investment-records";
import { MoneyMovementModel } from "@/models/money-movements";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useDialogState } from "@/hooks/use-dialog-state";
import { GoalModel } from "@/models/goals";

const GoalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const goalId = parseInt(id!);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Delete goal modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Toggle active modal state
  const [isToggleActiveModalOpen, setIsToggleActiveModalOpen] = useState(false);

  // Transfer config for new transfers
  const [transferConfig, setTransferConfig] = useState<GoalTransferConfig | undefined>(undefined);

  // History tab state - managed at page level
  const { state: tableState, actions: tableActions } = useTableState({
    initialPage: 1,
    initialPageSize: 10,
  });

  // Edit/Delete state for movements
  const [editTransfer, setEditTransfer] = useState<GoalTransferModel | undefined>();
  const [editRecord, setEditRecord] = useState<GoalInvestmentRecordModel | undefined>();
  const [historyDeleteModal, setHistoryDeleteModal] = useState<{
    open: boolean;
    type: 'transfer' | 'record' | undefined;
    id: number | undefined;
  }>({ open: false, type: undefined, id: undefined });

  // Dialog states for history edit
  const [historyTransferDialogOpen, setHistoryTransferDialogOpen] = useState(false);
  const [historyRecordDialogOpen, setHistoryRecordDialogOpen] = useState(false);
  const [isHistoryTransferLoading, setIsHistoryTransferLoading] = useState(false);
  const [isHistoryRecordLoading, setIsHistoryRecordLoading] = useState(false);

  // Mutations
  const updateGoal = useUpdateGoal();
  const toggleGoalActive = useToggleGoalActive();
  const createGoalTransfer = useCreateGoalTransfer();
  const updateGoalTransfer = useUpdateGoalTransfer();
  const { mutateAsync: deleteGoalTransfer } = useDeleteGoalTransfer();
  const createRecord = useCreateGoalInvestmentRecord();
  const updateRecord = useUpdateGoalInvestmentRecord();
  const { mutateAsync: deleteRecord } = useDeleteGoalInvestmentRecord();
  const { mutate: deleteGoal } = useDeleteGoal();

  // Queries
  const { data: goal, isLoading: isGoalLoading } = useGoalDetail(goalId);
  const { data: goalFundsSummary, isLoading: isFundsSummaryLoading } = useMoneySummary({ goalId });
  const { data: wallets, isLoading: isWalletsLoading } = useWallets();
  const { data: goals, isLoading: isGoalsLoading } = useGoals();
  const { data: assets, isLoading: isAssetsLoading } = useInvestmentAssets();
  const { data: instruments, isLoading: isInstrumentsLoading } = useInvestmentInstruments();
  const { data: currency, isLoading: isCurrencyLoading } = useCurrencyDetail(goal?.currency_code);
  const { data: currencies } = useCurrencies();
  const { data: investmentCategories } = useInvestmentCategories();

  // Paginated movements for history tab
  const { data: paged, isLoading: isMovementsLoading } = useMoneyMovementsPaginatedByGoal(goalId, {
    page: tableState.page,
    itemsPerPage: tableState.pageSize,
    searchTerm: tableState.searchTerm,
    filters: tableState.filters
  });

  const movements = paged?.data || [];
  const totalCount = paged?.count || 0;

  // Fetch related transfers and records for editing
  const goalTransferIds = movements?.filter(m => m.resource_type === MOVEMENT_TYPES.GOAL_TRANSFER).map(m => m.resource_id) || [];
  const { data: goalTransfers } = useGoalTransfers({ ids: goalTransferIds });
  const goalTransfersById = goalTransfers?.reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {} as Record<number, GoalTransferModel>) || {};

  const investmentRecordIds = movements?.filter(m => m.resource_type === MOVEMENT_TYPES.INVESTMENT_GROWTH).map(m => m.resource_id) || [];
  const { data: goalRecords } = useGoalInvestmentRecords({ ids: investmentRecordIds });
  const goalRecordsById = goalRecords?.reduce((acc, r) => {
    acc[r.id] = r;
    return acc;
  }, {} as Record<number, GoalInvestmentRecordModel>) || {};

  // Form states managed at page level
  const form = useForm<GoalFormData>({
    defaultValues: defaultGoalFormValues,
  });
  const transferForm = useForm<GoalTransferFormData>({
    defaultValues: defaultGoalTransferFormData,
  });
  const recordForm = useForm<GoalInvestmentRecordFormData>({
    defaultValues: defaultGoalInvestmentRecordFormData,
  });

  // History forms (separate for edit operations)
  const historyTransferForm = useForm<GoalTransferFormData>({
    defaultValues: defaultGoalTransferFormData,
  });
  const historyRecordForm = useForm<GoalInvestmentRecordFormData>({
    defaultValues: defaultGoalInvestmentRecordFormData,
  });

  // Use dialog state hooks for main dialogs
  const goalDialog = useDialogState<GoalModel, GoalFormData>({
    form,
    defaultValues: defaultGoalFormValues,
    mapDataToForm: mapGoalToFormData,
  });

  const transferDialog = useDialogState<GoalTransferModel, GoalTransferFormData>({
    form: transferForm,
    defaultValues: defaultGoalTransferFormData,
    mapDataToForm: mapGoalTransferToFormData,
  });

  const recordDialog = useDialogState<GoalInvestmentRecordModel, GoalInvestmentRecordFormData>({
    form: recordForm,
    defaultValues: defaultGoalInvestmentRecordFormData,
    mapDataToForm: mapGoalInvestmentRecordToFormData,
  });

  const isLoading = isGoalLoading || isFundsSummaryLoading || isWalletsLoading ||
    isAssetsLoading || isInstrumentsLoading || isGoalsLoading || isCurrencyLoading;

  // Reset transfer form when dialog opens with specific config
  useEffect(() => {
    if (transferDialog.open && transferConfig) {
      if (transferConfig.mode === 'add_to_goal') {
        transferForm.reset({ ...defaultGoalTransferFormData, to_goal_id: goalId });
      } else if (transferConfig.mode === 'take_from_goal') {
        transferForm.reset({ ...defaultGoalTransferFormData, from_goal_id: goalId });
      } else if (transferConfig.mode === 'transfer_between_goals') {
        transferForm.reset({ ...defaultGoalTransferFormData, from_goal_id: goalId });
      } else if (transferConfig.mode === 'transfer_with_same_goals') {
        transferForm.reset({ ...defaultGoalTransferFormData, from_goal_id: goalId, to_goal_id: goalId });
      }
    }
  }, [transferDialog.open, transferConfig, goalId, transferForm]);

  // Reset record form when dialog opens
  useEffect(() => {
    if (recordDialog.open && goal) {
      recordForm.reset({ ...defaultGoalInvestmentRecordFormData, goal_id: goal.id });
    }
  }, [recordDialog.open, goal, recordForm]);

  // Reset history transfer form when editing
  useEffect(() => {
    if (historyTransferDialogOpen && editTransfer) {
      historyTransferForm.reset({
        from_wallet_id: editTransfer.from_wallet_id || null,
        from_goal_id: editTransfer.from_goal_id || null,
        from_instrument_id: editTransfer.from_instrument_id || null,
        from_asset_id: editTransfer.from_asset_id || null,
        to_wallet_id: editTransfer.to_wallet_id || null,
        to_goal_id: editTransfer.to_goal_id || null,
        to_instrument_id: editTransfer.to_instrument_id || null,
        to_asset_id: editTransfer.to_asset_id || null,
        from_amount: editTransfer.from_amount || 0,
        to_amount: editTransfer.to_amount || 0,
        from_amount_unit: editTransfer.from_amount_unit,
        to_amount_unit: editTransfer.to_amount_unit,
        date: editTransfer.date || new Date().toISOString().split("T")[0],
      });
    }
  }, [historyTransferDialogOpen, editTransfer, historyTransferForm]);

  // Reset history record form when editing
  useEffect(() => {
    if (historyRecordDialogOpen && editRecord) {
      historyRecordForm.reset({
        goal_id: editRecord.goal_id || null,
        instrument_id: editRecord.instrument_id || null,
        asset_id: editRecord.asset_id || null,
        wallet_id: editRecord.wallet_id || null,
        category_id: editRecord.category_id || null,
        amount: editRecord.amount || 0,
        amount_unit: editRecord.amount_unit,
        date: editRecord.date || new Date().toISOString().split("T")[0],
        description: editRecord.description || "",
        is_valuation: editRecord.is_valuation || false,
      });
    }
  }, [historyRecordDialogOpen, editRecord, historyRecordForm]);

  // Mutation callbacks
  const { handleError: handleGoalError } = useMutationCallbacks({
    setIsLoading: goalDialog.setIsLoading,
    onOpenChange: (open) => !open && goalDialog.close(),
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.GOALS
  });

  const { handleError: handleTransferError } = useMutationCallbacks({
    setIsLoading: transferDialog.setIsLoading,
    onOpenChange: (open) => !open && transferDialog.close(),
    form: transferForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.GOAL_TRANSFERS
  });

  const { handleError: handleRecordError } = useMutationCallbacks({
    setIsLoading: recordDialog.setIsLoading,
    onOpenChange: (open) => !open && recordDialog.close(),
    form: recordForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.INVESTMENT_RECORDS
  });

  // History mutation callbacks
  const { handleSuccess: handleHistoryTransferSuccess, handleError: handleHistoryTransferError } = useMutationCallbacks({
    setIsLoading: setIsHistoryTransferLoading,
    onOpenChange: (open) => {
      setHistoryTransferDialogOpen(open);
      if (!open) setEditTransfer(undefined);
    },
    form: historyTransferForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.GOAL_TRANSFERS
  });

  const { handleSuccess: handleHistoryRecordSuccess, handleError: handleHistoryRecordError } = useMutationCallbacks({
    setIsLoading: setIsHistoryRecordLoading,
    onOpenChange: (open) => {
      setHistoryRecordDialogOpen(open);
      if (!open) setEditRecord(undefined);
    },
    form: historyRecordForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.INVESTMENT_RECORDS
  });

  const handleFormSubmit = (data: GoalFormData) => {
    if (!goal) return;
    goalDialog.setIsLoading(true);
    updateGoal.mutate({ id: goal.id, ...data }, {
      onSuccess: () => goalDialog.handleSuccess(),
      onError: handleGoalError
    });
  };

  const handleTransferFormSubmit = (data: GoalTransferFormData) => {
    transferDialog.setIsLoading(true);
    const transferData = {
      from_wallet_id: data.from_wallet_id && data.from_wallet_id > 0 ? data.from_wallet_id : null,
      from_goal_id: data.from_goal_id && data.from_goal_id > 0 ? data.from_goal_id : null,
      from_instrument_id: data.from_instrument_id && data.from_instrument_id > 0 ? data.from_instrument_id : null,
      from_asset_id: data.from_asset_id && data.from_asset_id > 0 ? data.from_asset_id : null,
      to_wallet_id: data.to_wallet_id && data.to_wallet_id > 0 ? data.to_wallet_id : null,
      to_goal_id: data.to_goal_id && data.to_goal_id > 0 ? data.to_goal_id : null,
      to_instrument_id: data.to_instrument_id && data.to_instrument_id > 0 ? data.to_instrument_id : null,
      to_asset_id: data.to_asset_id && data.to_asset_id > 0 ? data.to_asset_id : null,
      from_amount: data.from_amount,
      to_amount: data.to_amount,
      from_amount_unit: data.from_amount_unit || null,
      to_amount_unit: data.to_amount_unit || null,
      date: data.date,
    };
    createGoalTransfer.mutate(transferData, {
      onSuccess: () => {
        transferDialog.handleSuccess();
        setTransferConfig(undefined);
      },
      onError: handleTransferError
    });
  };

  const handleRecordFormSubmit = (data: GoalInvestmentRecordFormData) => {
    recordDialog.setIsLoading(true);
    const cleanData = { ...data };
    cleanData.wallet_id = data.wallet_id || null;
    cleanData.category_id = data.category_id || null;
    if (!data.instrument_id) cleanData.instrument_id = null;
    if (!data.asset_id) cleanData.asset_id = null;
    cleanData.amount_unit = data.amount_unit;
    createRecord.mutate(cleanData, {
      onSuccess: () => recordDialog.handleSuccess(),
      onError: handleRecordError
    });
  };

  // History handlers
  const handleHistoryTransferSubmit = (data: GoalTransferFormData) => {
    if (!editTransfer) return;
    setIsHistoryTransferLoading(true);
    const transferData = {
      from_wallet_id: data.from_wallet_id && data.from_wallet_id > 0 ? data.from_wallet_id : null,
      from_goal_id: data.from_goal_id && data.from_goal_id > 0 ? data.from_goal_id : null,
      from_instrument_id: data.from_instrument_id && data.from_instrument_id > 0 ? data.from_instrument_id : null,
      from_asset_id: data.from_asset_id && data.from_asset_id > 0 ? data.from_asset_id : null,
      to_wallet_id: data.to_wallet_id && data.to_wallet_id > 0 ? data.to_wallet_id : null,
      to_goal_id: data.to_goal_id && data.to_goal_id > 0 ? data.to_goal_id : null,
      to_instrument_id: data.to_instrument_id && data.to_instrument_id > 0 ? data.to_instrument_id : null,
      to_asset_id: data.to_asset_id && data.to_asset_id > 0 ? data.to_asset_id : null,
      from_amount: data.from_amount,
      to_amount: data.to_amount,
      from_amount_unit: data.from_amount_unit || null,
      to_amount_unit: data.to_amount_unit || null,
      date: data.date,
    };
    updateGoalTransfer.mutate({ id: editTransfer.id, ...transferData }, {
      onSuccess: handleHistoryTransferSuccess,
      onError: handleHistoryTransferError
    });
  };

  const handleHistoryRecordSubmit = (data: GoalInvestmentRecordFormData) => {
    if (!editRecord) return;
    setIsHistoryRecordLoading(true);
    const cleanData = { ...data };
    cleanData.wallet_id = data.wallet_id || null;
    cleanData.category_id = data.category_id || null;
    if (!data.instrument_id) cleanData.instrument_id = null;
    if (!data.asset_id) cleanData.asset_id = null;
    cleanData.amount_unit = data.amount_unit;
    updateRecord.mutate({ id: editRecord.id, ...cleanData }, {
      onSuccess: handleHistoryRecordSuccess,
      onError: handleHistoryRecordError
    });
  };

  const handleMovementEdit = (movement: MoneyMovementModel) => {
    if (movement.resource_type === MOVEMENT_TYPES.GOAL_TRANSFER) {
      const transfer = goalTransfersById[movement.resource_id];
      if (transfer) {
        setEditTransfer(transfer);
        setHistoryTransferDialogOpen(true);
      }
    } else if (movement.resource_type === MOVEMENT_TYPES.INVESTMENT_GROWTH) {
      const record = goalRecordsById[movement.resource_id];
      if (record) {
        setEditRecord(record);
        setHistoryRecordDialogOpen(true);
      }
    }
  };

  const handleMovementDelete = (movement: MoneyMovementModel) => {
    let type: 'transfer' | 'record' | undefined;
    if (movement.resource_type === MOVEMENT_TYPES.GOAL_TRANSFER) {
      type = 'transfer';
    } else if (movement.resource_type === MOVEMENT_TYPES.INVESTMENT_GROWTH) {
      type = 'record';
    }
    if (type && movement.resource_id) {
      setHistoryDeleteModal({ open: true, type, id: movement.resource_id });
    }
  };

  const handleConfirmHistoryDelete = async () => {
    if (!historyDeleteModal.id) return;
    try {
      if (historyDeleteModal.type === 'transfer') {
        await deleteGoalTransfer(historyDeleteModal.id);
      } else if (historyDeleteModal.type === 'record') {
        await deleteRecord(historyDeleteModal.id);
      }
      setHistoryDeleteModal({ open: false, type: undefined, id: undefined });
      queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  // Check loading states and goal existence before accessing goal properties
  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <PageLoading message="Memuat detail target..." />
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!goal) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">Target tidak ditemukan</p>
            <Button onClick={() => navigate('/goal')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Target
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const totalAmount = goalFundsSummary?.reduce((sum, fund) => sum + fund.amount, 0) || 0;
  const percentage = Math.min(totalAmount / goal.target_amount * 100, 100);

  // Calculate totals from movements for overview
  let totalAmountRecord = 0;
  let totalAmountTransfer = 0;

  for (const movement of movements || []) {
    if (movement.resource_type === MOVEMENT_TYPES.INVESTMENT_GROWTH) {
      totalAmountRecord += movement.amount;
    } else if (movement.resource_type === MOVEMENT_TYPES.GOAL_TRANSFER) {
      totalAmountTransfer += movement.amount;
    }
  }

  const handleEdit = () => {
    if (goal) {
      goalDialog.openEdit(goal);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteGoal(goal.id, {
      onSuccess: () => {
        navigate('/goal');
      }
    });
  };

  const handleToggleActiveClick = () => {
    setIsToggleActiveModalOpen(true);
  };

  const handleConfirmToggleActive = () => {
    toggleGoalActive.mutate({
      id: goal.id,
      is_active: !goal.is_active,
    });
    setIsToggleActiveModalOpen(false);
  };

  const handleAddRecord = () => {
    recordDialog.openAdd();
  };

  const openTransferWithConfig = (config: GoalTransferConfig) => {
    setTransferConfig(config);
    transferDialog.openAdd();
  };

  const handleAddToGoal = () => {
    openTransferWithConfig({ mode: 'add_to_goal', goalId: goal.id });
  };

  const handleTakeFromGoal = () => {
    openTransferWithConfig({ mode: 'take_from_goal', goalId: goal.id });
  };

  const handleTransferBetweenGoals = () => {
    openTransferWithConfig({ mode: 'transfer_between_goals', goalId: goal.id });
  };

  const handleTransferBetweenInstrumentsOrAssets = () => {
    openTransferWithConfig({ mode: 'transfer_with_same_goals', goalId: goal.id });
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/goal')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{goal.name}</h1>
                <p className="text-muted-foreground">Detail Target Keuangan</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Aksi
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Goal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleToggleActiveClick} className="cursor-pointer">
                    {goal.is_active ? (
                      <>
                        <PowerOff className="w-4 h-4 mr-2" />
                        Nonaktifkan Goal
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4 mr-2" />
                        Aktifkan Goal
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteClick} className="cursor-pointer text-destructive focus:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus Goal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Action Buttons */}
          {goal.is_active && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAddToGoal} size="sm" className="shrink-0">
                <Plus className="w-4 h-4 mr-1" />
                Tambah Dana
              </Button>
              <Button onClick={handleTakeFromGoal} variant="outline" size="sm" className="shrink-0">
                <Minus className="w-4 h-4 mr-1" />
                Ambil Dana
              </Button>
              <Button onClick={handleTransferBetweenGoals} variant="outline" size="sm" className="shrink-0">
                <ArrowRightLeft className="w-4 h-4 mr-1" />
                Transfer Ke Goal Lain
              </Button>
              <Button onClick={handleTransferBetweenInstrumentsOrAssets} variant="outline" size="sm" className="shrink-0 text-left">
                <ArrowRightLeft className="w-4 h-4 mr-1" />
                <span className="leading-tight">
                  Transfer Ke Instrumen/Aset Lain
                  <span className="block text-xs text-muted-foreground">Dalam Goal Ini</span>
                </span>
              </Button>
              <Button onClick={handleAddRecord} variant="outline" size="sm" className="shrink-0">
                <BarChart3 className="w-4 h-4 mr-1" />
                Update Progress
              </Button>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">Riwayat</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <GoalOverview
                goal={goal}
                totalAmount={totalAmount}
                percentage={percentage}
                totalAmountRecord={totalAmountRecord}
                totalAmountTransfer={totalAmountTransfer}
                currency={currency}
              />
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <GoalMovementList
                // Data
                movements={movements}
                totalCount={totalCount}
                isLoading={isMovementsLoading}

                // Table state
                searchTerm={tableState.searchTerm}
                onSearchChange={tableActions.handleSearchChange}
                filters={tableState.filters}
                onFiltersChange={tableActions.handleFiltersChange}
                page={tableState.page}
                pageSize={tableState.pageSize}
                onPageChange={tableActions.handlePageChange}
                onPageSizeChange={tableActions.handlePageSizeChange}

                // Filter options
                wallets={wallets || []}
                instruments={instruments || []}
                assets={assets || []}
                categories={investmentCategories || []}

                // Handlers
                onEdit={handleMovementEdit}
                onDelete={handleMovementDelete}

                // Transfer Dialog
                transferDialogOpen={historyTransferDialogOpen}
                onTransferDialogChange={(open) => {
                  setHistoryTransferDialogOpen(open);
                  if (!open) setEditTransfer(undefined);
                }}
                transferForm={historyTransferForm}
                isTransferFormLoading={isHistoryTransferLoading}
                onTransferFormSubmit={handleHistoryTransferSubmit}
                editTransfer={editTransfer}
                goals={goals || []}

                // Record Dialog
                recordDialogOpen={historyRecordDialogOpen}
                onRecordDialogChange={(open) => {
                  setHistoryRecordDialogOpen(open);
                  if (!open) setEditRecord(undefined);
                }}
                recordForm={historyRecordForm}
                isRecordFormLoading={isHistoryRecordLoading}
                onRecordFormSubmit={handleHistoryRecordSubmit}
                editRecord={editRecord}

                // Delete Modal
                deleteModalOpen={historyDeleteModal.open}
                onDeleteModalChange={(open) => setHistoryDeleteModal({ ...historyDeleteModal, open })}
                onConfirmDelete={handleConfirmHistoryDelete}
                deleteItemType={historyDeleteModal.type}
              />
            </TabsContent>
          </Tabs>

          {/* Goal Delete Modal */}
          <ConfirmationModal
            open={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            onConfirm={handleConfirmDelete}
            title="Hapus Goal"
            description="Apakah Anda yakin ingin menghapus goal ini? Tindakan ini tidak dapat dibatalkan."
            confirmText="Ya, Hapus"
            cancelText="Batal"
            variant="destructive"
          />

          {/* Goal Toggle Active Modal */}
          <ConfirmationModal
            open={isToggleActiveModalOpen}
            onOpenChange={setIsToggleActiveModalOpen}
            onConfirm={handleConfirmToggleActive}
            title={goal.is_active ? "Nonaktifkan Goal" : "Aktifkan Goal"}
            description={
              goal.is_active
                ? `Apakah Anda yakin ingin menonaktifkan goal "${goal.name}"?`
                : `Apakah Anda yakin ingin mengaktifkan goal "${goal.name}"?`
            }
            confirmText={goal.is_active ? "Nonaktifkan" : "Aktifkan"}
            variant={goal.is_active ? "destructive" : "default"}
          />

          {/* Goal Edit Dialog */}
          <GoalDialog
            open={goalDialog.open}
            onOpenChange={(open) => !open && goalDialog.close()}
            form={form}
            isLoading={goalDialog.isLoading}
            onSubmit={handleFormSubmit}
            currencies={currencies}
            goal={goal}
          />

          {/* New Transfer Dialog (Add funds) */}
          <GoalTransferDialog
            open={transferDialog.open}
            onOpenChange={(open) => {
              if (!open) {
                transferDialog.close();
                setTransferConfig(undefined);
              }
            }}
            form={transferForm}
            isLoading={transferDialog.isLoading}
            onSubmit={handleTransferFormSubmit}
            transferConfig={transferConfig}
            wallets={wallets}
            goals={goal ? [goal] : []}
            instruments={instruments}
            assets={assets}
          />

          {/* New Record Dialog (Update progress) */}
          <GoalInvestmentRecordDialog
            open={recordDialog.open}
            onOpenChange={(open) => !open && recordDialog.close()}
            form={recordForm}
            isLoading={recordDialog.isLoading}
            onSubmit={handleRecordFormSubmit}
            goals={goal ? [goal] : []}
            instruments={instruments}
            assets={assets}
            wallets={wallets}
            categories={investmentCategories}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default GoalDetail;
