import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useTableState } from "@/hooks/use-table-state";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { MOVEMENT_TYPES } from "@/constants/enums";
import { GoalTransferModel } from "@/models/goal-transfers";
import { GoalInvestmentRecordModel } from "@/models/goal-investment-records";
import { GoalTransferFormData, defaultGoalTransferFormData } from "@/form-dto/goal-transfers";
import { GoalInvestmentRecordFormData, defaultGoalInvestmentRecordFormData } from "@/form-dto/goal-investment-records";
import { MoneyMovementModel } from "@/models/money-movements";
import { useGoalTransfers, useUpdateGoalTransfer, useDeleteGoalTransfer } from "@/hooks/queries/use-goal-transfers";
import { useGoalInvestmentRecords, useUpdateGoalInvestmentRecord, useDeleteGoalInvestmentRecord } from "@/hooks/queries/use-goal-investment-records";

interface UseGoalMovementHistoryProps {
    id: number;
    usePaginatedQuery: (id: number, params: any) => any;
}

export const useGoalMovementHistory = ({ id, usePaginatedQuery }: UseGoalMovementHistoryProps) => {
    const queryClient = useQueryClient();

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
        type: "transfer" | "record" | undefined;
        id: number | undefined;
    }>({ open: false, type: undefined, id: undefined });

    // Dialog states for history edit
    const [historyTransferDialogOpen, setHistoryTransferDialogOpen] = useState(false);
    const [historyRecordDialogOpen, setHistoryRecordDialogOpen] = useState(false);
    const [isHistoryTransferLoading, setIsHistoryTransferLoading] = useState(false);
    const [isHistoryRecordLoading, setIsHistoryRecordLoading] = useState(false);

    // Mutations
    const updateGoalTransfer = useUpdateGoalTransfer();
    const { mutateAsync: deleteGoalTransfer } = useDeleteGoalTransfer();
    const updateRecord = useUpdateGoalInvestmentRecord();
    const { mutateAsync: deleteRecord } = useDeleteGoalInvestmentRecord();

    // Paginated movements
    const { data: paged, isLoading: isMovementsLoading } = usePaginatedQuery(id, {
        page: tableState.page,
        itemsPerPage: tableState.pageSize,
        searchTerm: tableState.searchTerm,
        filters: tableState.filters,
    });

    const movements = paged?.data || [];
    const totalCount = paged?.count || 0;

    // Fetch related transfers and records for editing
    const goalTransferIds = movements?.filter((m) => m.resource_type === MOVEMENT_TYPES.GOAL_TRANSFER).map((m) => m.resource_id) || [];
    const { data: goalTransfers } = useGoalTransfers({ ids: goalTransferIds });
    const goalTransfersById = goalTransfers?.reduce((acc, t) => {
        acc[t.id] = t;
        return acc;
    }, {} as Record<number, GoalTransferModel>) || {};

    const investmentRecordIds = movements?.filter((m) => m.resource_type === MOVEMENT_TYPES.INVESTMENT_GROWTH).map((m) => m.resource_id) || [];
    const { data: goalRecords } = useGoalInvestmentRecords({ ids: investmentRecordIds });
    const goalRecordsById = goalRecords?.reduce((acc, r) => {
        acc[r.id] = r;
        return acc;
    }, {} as Record<number, GoalInvestmentRecordModel>) || {};

    // History forms (separate for edit operations)
    const historyTransferForm = useForm<GoalTransferFormData>({
        defaultValues: defaultGoalTransferFormData,
    });
    const historyRecordForm = useForm<GoalInvestmentRecordFormData>({
        defaultValues: defaultGoalInvestmentRecordFormData,
    });

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

    // History mutation callbacks
    const { handleSuccess: handleHistoryTransferSuccess, handleError: handleHistoryTransferError } = useMutationCallbacks({
        setIsLoading: setIsHistoryTransferLoading,
        onOpenChange: (open) => {
            setHistoryTransferDialogOpen(open);
            if (!open) setEditTransfer(undefined);
        },
        form: historyTransferForm,
        queryKeysToInvalidate: QUERY_KEY_SETS.GOAL_TRANSFERS,
    });

    const { handleSuccess: handleHistoryRecordSuccess, handleError: handleHistoryRecordError } = useMutationCallbacks({
        setIsLoading: setIsHistoryRecordLoading,
        onOpenChange: (open) => {
            setHistoryRecordDialogOpen(open);
            if (!open) setEditRecord(undefined);
        },
        form: historyRecordForm,
        queryKeysToInvalidate: QUERY_KEY_SETS.INVESTMENT_RECORDS,
    });

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
        updateGoalTransfer.mutate(
            { id: editTransfer.id, ...transferData },
            {
                onSuccess: handleHistoryTransferSuccess,
                onError: handleHistoryTransferError,
            }
        );
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
        updateRecord.mutate(
            { id: editRecord.id, ...cleanData },
            {
                onSuccess: handleHistoryRecordSuccess,
                onError: handleHistoryRecordError,
            }
        );
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
        let type: "transfer" | "record" | undefined;
        if (movement.resource_type === MOVEMENT_TYPES.GOAL_TRANSFER) {
            type = "transfer";
        } else if (movement.resource_type === MOVEMENT_TYPES.INVESTMENT_GROWTH) {
            type = "record";
        }
        if (type && movement.resource_id) {
            setHistoryDeleteModal({ open: true, type, id: movement.resource_id });
        }
    };

    const handleConfirmHistoryDelete = async () => {
        if (!historyDeleteModal.id) return;
        try {
            if (historyDeleteModal.type === "transfer") {
                await deleteGoalTransfer(historyDeleteModal.id);
            } else if (historyDeleteModal.type === "record") {
                await deleteRecord(historyDeleteModal.id);
            }
            setHistoryDeleteModal({ open: false, type: undefined, id: undefined });
            queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    return {
        // Data
        movements,
        totalCount,
        isLoading: isMovementsLoading,

        // Table state
        searchTerm: tableState.searchTerm,
        onSearchChange: tableActions.handleSearchChange,
        filters: tableState.filters,
        onFiltersChange: tableActions.handleFiltersChange,
        page: tableState.page,
        pageSize: tableState.pageSize,
        onPageChange: tableActions.handlePageChange,
        onPageSizeChange: tableActions.handlePageSizeChange,

        // Handlers
        onEdit: handleMovementEdit,
        onDelete: handleMovementDelete,

        // Transfer Dialog
        transferDialogOpen: historyTransferDialogOpen,
        onTransferDialogChange: (open: boolean) => {
            setHistoryTransferDialogOpen(open);
            if (!open) setEditTransfer(undefined);
        },
        transferForm: historyTransferForm,
        isTransferFormLoading: isHistoryTransferLoading,
        onTransferFormSubmit: handleHistoryTransferSubmit,
        editTransfer,

        // Record Dialog
        recordDialogOpen: historyRecordDialogOpen,
        onRecordDialogChange: (open: boolean) => {
            setHistoryRecordDialogOpen(open);
            if (!open) setEditRecord(undefined);
        },
        recordForm: historyRecordForm,
        isRecordFormLoading: isHistoryRecordLoading,
        onRecordFormSubmit: handleHistoryRecordSubmit,
        editRecord,

        // Delete Modal
        deleteModalOpen: historyDeleteModal.open,
        onDeleteModalChange: (open: boolean) => setHistoryDeleteModal({ ...historyDeleteModal, open }),
        onConfirmDelete: handleConfirmHistoryDelete,
        deleteItemType: historyDeleteModal.type,
    };
};
