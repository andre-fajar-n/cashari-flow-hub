import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Edit, Trash2, Plus, Minus, ArrowRightLeft, BarChart3, Power, PowerOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { useDialogState } from "@/hooks/use-dialog-state";
import { GoalModel } from "@/models/goals";
import { useGoalMovementHistory } from "@/hooks/use-goal-movement-history";
import { useMoneyMovementsPaginatedByGoal } from "@/hooks/queries/paginated/use-money-movements-paginated";
import { useDeleteGoal, useGoalDetail, useGoals, useUpdateGoal, useToggleGoalActive } from "@/hooks/queries/use-goals";
import { useCreateGoalTransfer } from "@/hooks/queries/use-goal-transfers";
import { useCreateGoalInvestmentRecord } from "@/hooks/queries/use-goal-investment-records";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useInvestmentAssets } from "@/hooks/queries/use-investment-assets";
import { useInvestmentInstruments } from "@/hooks/queries/use-investment-instruments";
import { useCurrencies, useCurrencyDetail } from "@/hooks/queries/use-currencies";
import { useInvestmentCategories } from "@/hooks/queries/use-categories";
import { MOVEMENT_TYPES } from "@/constants/enums";
import { GoalFormData, defaultGoalFormValues, mapGoalToFormData } from "@/form-dto/goals";
import { GoalTransferFormData, defaultGoalTransferFormData, mapGoalTransferToFormData } from "@/form-dto/goal-transfers";
import { GoalInvestmentRecordFormData, defaultGoalInvestmentRecordFormData, mapGoalInvestmentRecordToFormData } from "@/form-dto/goal-investment-records";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { GoalTransferModel } from "@/models/goal-transfers";
import { GoalInvestmentRecordModel } from "@/models/goal-investment-records";

const GoalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const goalId = parseInt(id!);
  const navigate = useNavigate();

  // Delete goal modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Toggle active modal state
  const [isToggleActiveModalOpen, setIsToggleActiveModalOpen] = useState(false);

  // Transfer config for new transfers
  const [transferConfig, setTransferConfig] = useState<GoalTransferConfig | undefined>(undefined);

  // Use the refactored hook for movement history
  const history = useGoalMovementHistory({
    id: goalId,
    usePaginatedQuery: useMoneyMovementsPaginatedByGoal,
  });

  // Mutations
  const updateGoal = useUpdateGoal();
  const toggleGoalActive = useToggleGoalActive();
  const createGoalTransfer = useCreateGoalTransfer();
  const createRecord = useCreateGoalInvestmentRecord();
  const { mutate: deleteGoal } = useDeleteGoal();

  // Queries
  const { data: goal, isLoading: isGoalLoading } = useGoalDetail(goalId);
  const { data: wallets, isLoading: isWalletsLoading } = useWallets();
  const { data: goals, isLoading: isGoalsLoading } = useGoals();
  const { data: assets, isLoading: isAssetsLoading } = useInvestmentAssets();
  const { data: instruments, isLoading: isInstrumentsLoading } = useInvestmentInstruments();
  const { data: currency, isLoading: isCurrencyLoading } = useCurrencyDetail(goal?.currency_code);
  const { data: currencies } = useCurrencies();
  const { data: investmentCategories } = useInvestmentCategories();

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

  const isLoading = isGoalLoading || isWalletsLoading || isAssetsLoading ||
    isInstrumentsLoading || isGoalsLoading || isCurrencyLoading || history.isLoading;

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
    onOpenChange: (open) => {
      if (!open) recordDialog.close();
    },
    form: recordForm,
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

  // Calculate totals from movements for overview
  let totalAmountRecord = 0;
  let totalAmountTransfer = 0;

  for (const movement of history.movements || []) {
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
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">{goal.name}</h1>
                  <Badge variant={goal.is_active ? "default" : "secondary"}>
                    {goal.is_active ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </div>
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
                currency={currency}
              />
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <GoalMovementList
                originPage="goal"
                {...history}
                // Filter options
                wallets={wallets || []}
                instruments={instruments || []}
                assets={assets || []}
                categories={investmentCategories || []}
                goals={goals || []}
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
