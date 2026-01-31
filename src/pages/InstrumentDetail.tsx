import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import InvestmentInstrumentDialog from "@/components/investment/InvestmentInstrumentDialog";
import InstrumentOverview from "@/components/instrument/InstrumentOverview";
import PageLoading from "@/components/PageLoading";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  useUpdateInvestmentInstrument,
  useDeleteInvestmentInstrument,
  useInvestmentInstrumentDetail,
  useInvestmentInstruments
} from "@/hooks/queries/use-investment-instruments";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { InstrumentFormData, defaultInstrumentFormValues } from "@/form-dto/investment-instruments";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useDialogState } from "@/hooks/use-dialog-state";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import GoalMovementList from "@/components/goal/GoalMovementList";
import { useMoneyMovementsPaginatedByInstrument } from "@/hooks/queries/paginated/use-money-movements-paginated";
import { useTableState } from "@/hooks/use-table-state";
import { useDeleteGoalInvestmentRecord, useDeleteGoalTransfer, useGoalInvestmentRecords, useGoals, useGoalTransfers, useInvestmentAssets, useInvestmentCategories, useUpdateGoalInvestmentRecord, useUpdateGoalTransfer, useWallets } from "@/hooks/queries";
import { MoneyMovementModel } from "@/models/money-movements";
import { MOVEMENT_TYPES } from "@/constants/enums";
import { GoalTransferModel } from "@/models/goal-transfers";
import { GoalInvestmentRecordModel } from "@/models/goal-investment-records";
import { useQueryClient } from "@tanstack/react-query";
import { defaultGoalTransferFormData, GoalTransferFormData, mapGoalTransferToFormData } from "@/form-dto/goal-transfers";
import { defaultGoalInvestmentRecordFormData, GoalInvestmentRecordFormData, mapGoalInvestmentRecordToFormData } from "@/form-dto/goal-investment-records";
import { GoalFormData } from "@/form-dto/goals";
import { GoalTransferConfig } from "@/components/goal/GoalTransferModes";

const InstrumentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const instrumentId = parseInt(id!);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // History tab state - managed at page level
  const { state: tableState, actions: tableActions } = useTableState({
    initialPage: 1,
    initialPageSize: 10,
  });

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Mutations
  const updateInstrument = useUpdateInvestmentInstrument();
  const { mutate: deleteInstrument } = useDeleteInvestmentInstrument();
  const { mutateAsync: deleteGoalTransfer } = useDeleteGoalTransfer();
  const { mutateAsync: deleteRecord } = useDeleteGoalInvestmentRecord();
  const updateGoalTransfer = useUpdateGoalTransfer();
  const updateRecord = useUpdateGoalInvestmentRecord();

  // Queries
  const { data: instrument, isLoading: isInstrumentLoading } = useInvestmentInstrumentDetail(instrumentId);
  const { data: wallets, isLoading: isWalletsLoading } = useWallets();
  const { data: goals, isLoading: isGoalsLoading } = useGoals();
  const { data: assets, isLoading: isAssetsLoading } = useInvestmentAssets();
  const { data: instruments, isLoading: isInstrumensLoading } = useInvestmentInstruments();
  const { data: investmentCategories, isLoading: isInvestmentCategoriesLoading } = useInvestmentCategories();

  // Paginated movements for history tab
  const { data: paged, isLoading: isMovementsLoading } = useMoneyMovementsPaginatedByInstrument(instrumentId, {
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
  const form = useForm<InstrumentFormData>({
    defaultValues: defaultInstrumentFormValues,
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

  // Dialog state
  const instrumentDialog = useDialogState<InvestmentInstrumentModel, InstrumentFormData>({
    form,
    defaultValues: defaultInstrumentFormValues,
    mapDataToForm: (data) => ({
      name: data.name || "",
      unit_label: data.unit_label || "",
      is_trackable: data.is_trackable ?? true,
    }),
  });

  // Edit/Delete state for movements
  const [editTransfer, setEditTransfer] = useState<GoalTransferModel | undefined>();
  const [editRecord, setEditRecord] = useState<GoalInvestmentRecordModel | undefined>();
  const [historyDeleteModal, setHistoryDeleteModal] = useState<{
    open: boolean;
    type: 'transfer' | 'record' | undefined;
    id: number | undefined;
  }>({ open: false, type: undefined, id: undefined });
  // Transfer config for new transfers
  const [transferConfig, setTransferConfig] = useState<GoalTransferConfig | undefined>(undefined);


  // Dialog states for history edit
  const [historyTransferDialogOpen, setHistoryTransferDialogOpen] = useState(false);
  const [historyRecordDialogOpen, setHistoryRecordDialogOpen] = useState(false);
  const [isHistoryTransferLoading, setIsHistoryTransferLoading] = useState(false);
  const [isHistoryRecordLoading, setIsHistoryRecordLoading] = useState(false);

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

  const isLoading = isInstrumentLoading || isMovementsLoading || isWalletsLoading || isGoalsLoading || isAssetsLoading ||
    isInstrumensLoading || isInvestmentCategoriesLoading;

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

  // Mutation callbacks
  const { handleSuccess, handleError } = useMutationCallbacks({
    setIsLoading: instrumentDialog.setIsLoading,
    onOpenChange: (open) => !open && instrumentDialog.close(),
    form,
    queryKeysToInvalidate: [...QUERY_KEY_SETS.INVESTMENT_INSTRUMENTS, "instrument_detail_summary"]
  });

  const handleFormSubmit = (data: InstrumentFormData) => {
    if (!instrument) return;
    instrumentDialog.setIsLoading(true);
    updateInstrument.mutate({ id: instrument.id, ...data }, {
      onSuccess: handleSuccess,
      onError: handleError
    });
  };

  const handleDelete = () => {
    if (!instrument) return;
    deleteInstrument(instrument.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        navigate("/investment-instrument");
      }
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

  // Reset record form when dialog opens
  useEffect(() => {
    if (recordDialog.open && instrument) {
      recordForm.reset({ ...defaultGoalInvestmentRecordFormData, instrument_id: instrument.id });
    }
  }, [recordDialog.open, instrument, recordForm]);

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

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <PageLoading />
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!instrument) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <p className="text-muted-foreground">Instrumen tidak ditemukan</p>
            <Button variant="outline" onClick={() => navigate("/investment-instrument")}>
              Kembali ke Daftar Instrumen
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          title="Hapus Instrumen"
          description={`Apakah Anda yakin ingin menghapus instrumen "${instrument.name}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Hapus"
          variant="destructive"
          onConfirm={handleDelete}
        />

        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/investment-instrument")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{instrument.name}</h1>
                  {instrument.is_trackable ? (
                    <Badge variant="secondary">Trackable</Badge>
                  ) : (
                    <Badge variant="outline">Non-trackable</Badge>
                  )}
                </div>
                {instrument.unit_label && (
                  <p className="text-muted-foreground text-sm">
                    Unit: {instrument.unit_label}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => instrumentDialog.openEdit(instrument)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit Instrumen</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsDeleteModalOpen(true)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Hapus Instrumen</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Ringkasan</TabsTrigger>
              <TabsTrigger value="history">Riwayat</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <InstrumentOverview instrument={instrument} />
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <GoalMovementList
                originPage="instrument"

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
                assets={assets || []}
                categories={investmentCategories || []}
                instruments={instruments || []}

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
        </div>

        {/* Edit Dialog */}
        <InvestmentInstrumentDialog
          open={instrumentDialog.open}
          onOpenChange={(open) => !open && instrumentDialog.close()}
          form={form}
          isLoading={instrumentDialog.isLoading}
          onSubmit={handleFormSubmit}
          instrument={instrumentDialog.selectedData}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default InstrumentDetail;
