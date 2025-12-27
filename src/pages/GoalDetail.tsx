import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Edit, Trash2, Plus, Minus, ArrowRightLeft, BarChart3 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import GoalDialog from "@/components/goal/GoalDialog";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import GoalOverview from "@/components/goal/GoalOverview";
import { GoalTransferConfig } from "@/components/goal/GoalTransferModes";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useMoneyMovements } from "@/hooks/queries/use-money-movements";
import MovementsDataTable from "@/components/shared/MovementsDataTable";
import { useDeleteGoal, useGoalDetail, useUpdateGoal } from "@/hooks/queries/use-goals";
import { useGoalTransfers, useCreateGoalTransfer, useUpdateGoalTransfer } from "@/hooks/queries/use-goal-transfers";
import { useGoalInvestmentRecords, useCreateGoalInvestmentRecord, useUpdateGoalInvestmentRecord } from "@/hooks/queries/use-goal-investment-records";
import { useMoneySummary } from "@/hooks/queries/use-money-summary";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useInvestmentAssets } from "@/hooks/queries/use-investment-assets";
import { useInvestmentInstruments } from "@/hooks/queries/use-investment-instruments";
import { useCurrencies, useCurrencyDetail } from "@/hooks/queries/use-currencies";
import { useInvestmentCategories } from "@/hooks/queries/use-categories";
import { MOVEMENT_TYPES } from "@/constants/enums";
import { GoalFormData, defaultGoalFormValues, mapGoalToFormData } from "@/form-dto/goals";
import { GoalTransferFormData, defaultGoalTransferFormData, mapGoalTransferToFormData } from "@/form-dto/goal-transfers";
import { GoalTransferModel } from "@/models/goal-transfers";
import { GoalInvestmentRecordModel } from "@/models/goal-investment-records";
import { GoalInvestmentRecordFormData, defaultGoalInvestmentRecordFormData, mapGoalInvestmentRecordToFormData } from "@/form-dto/goal-investment-records";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useDialogState } from "@/hooks/use-dialog-state";
import { GoalModel } from "@/models/goals";

const GoalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transferConfig, setTransferConfig] = useState<GoalTransferConfig | undefined>(undefined);

  const updateGoal = useUpdateGoal();
  const createGoalTransfer = useCreateGoalTransfer();
  const updateGoalTransfer = useUpdateGoalTransfer();
  const createRecord = useCreateGoalInvestmentRecord();
  const updateRecord = useUpdateGoalInvestmentRecord();
  const { mutate: deleteGoal } = useDeleteGoal();
  const { data: goal, isLoading: isGoalLoading } = useGoalDetail(parseInt(id!));
  const { data: goalTransfers, isLoading: isTransfersLoading } = useGoalTransfers();
  const { data: goalMovements, isLoading: isMovementsLoading } = useMoneyMovements({ goalId: parseInt(id!) });
  const { data: goalFundsSummary, isLoading: isFundsSummaryLoading } = useMoneySummary({ goalId: parseInt(id!) });
  const { data: wallets, isLoading: isWalletsLoading } = useWallets();
  const { data: assets, isLoading: isAssetsLoading } = useInvestmentAssets();
  const { data: instruments, isLoading: isInstrumentsLoading } = useInvestmentInstruments();
  const { data: goalRecords, isLoading: isRecordsLoading } = useGoalInvestmentRecords();
  const { data: currency, isLoading: isCurrencyLoading } = useCurrencyDetail(goal?.currency_code);
  const { data: currencies } = useCurrencies();
  const { data: investmentCategories } = useInvestmentCategories();
  const { data: goals } = useGoalDetail(parseInt(id!));

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

  // Use dialog state hooks
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

  const isLoading = isGoalLoading || isTransfersLoading || isMovementsLoading || isFundsSummaryLoading || isWalletsLoading ||
    isAssetsLoading || isInstrumentsLoading || isRecordsLoading || isCurrencyLoading;

  // Reset transfer form when dialog opens with specific config
  useEffect(() => {
    if (transferDialog.open && transferConfig) {
      const goalId = parseInt(id!);
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
  }, [transferDialog.open, transferConfig, id, transferForm]);

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
    onOpenChange: (open) => !open && recordDialog.close(),
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
      from_wallet_id: data.from_wallet_id > 0 ? data.from_wallet_id : null,
      from_goal_id: data.from_goal_id > 0 ? data.from_goal_id : null,
      from_instrument_id: data.from_instrument_id > 0 ? data.from_instrument_id : null,
      from_asset_id: data.from_asset_id > 0 ? data.from_asset_id : null,
      to_wallet_id: data.to_wallet_id > 0 ? data.to_wallet_id : null,
      to_goal_id: data.to_goal_id > 0 ? data.to_goal_id : null,
      to_instrument_id: data.to_instrument_id > 0 ? data.to_instrument_id : null,
      to_asset_id: data.to_asset_id > 0 ? data.to_asset_id : null,
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
  if (!goal || isLoading) {
    const message = !goal ? "Data tidak ditemukan" : "Memuat data..."
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{message}</p>
            <Button onClick={() => navigate('/goal')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Goal
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const totalAmount = goalFundsSummary?.reduce((sum, fund) => sum + fund.amount, 0) || 0;
  const percentage = Math.min(totalAmount / goal.target_amount * 100, 100);

  let totalAmountRecord = 0;
  let totalAmountTransfer = 0;

  for (const movement of goalMovements || []) {
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

  const handleSuccessCallback = () => {
    queryClient.invalidateQueries({ queryKey: ["money_movements"] });
    queryClient.invalidateQueries({ queryKey: ["goal_transfers"] });
    queryClient.invalidateQueries({ queryKey: ["goal_investment_records"] });
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
                  <DropdownMenuItem onClick={handleDeleteClick} className="cursor-pointer text-destructive focus:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus Goal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Action Buttons */}
          {goal.is_active && !goal.is_achieved && (
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
              <MovementsDataTable
                movements={goalMovements || []}
                transfers={goalTransfers || []}
                records={goalRecords || []}
                wallets={wallets || []}
                instruments={instruments || []}
                assets={assets || []}
                filterType="goal"
                title="Riwayat Pergerakan Dana"
                description="Kelola dan pantau semua pergerakan dana dalam goal ini"
                emptyMessage="Belum ada riwayat pergerakan dana"
                onSuccess={handleSuccessCallback}
              />
            </TabsContent>
          </Tabs>

          {/* Modals */}
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

          <GoalDialog
            open={goalDialog.open}
            onOpenChange={(open) => !open && goalDialog.close()}
            form={form}
            isLoading={goalDialog.isLoading}
            onSubmit={handleFormSubmit}
            currencies={currencies}
            goal={goal}
          />

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

          <GoalInvestmentRecordDialog
            open={recordDialog.open}
            onOpenChange={(open) => !open && recordDialog.close()}
            form={recordForm}
            isLoading={recordDialog.isLoading}
            onSubmit={handleRecordFormSubmit}
            goalId={goal.id}
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
