import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import DebtDialog from "@/components/debt/DebtDialog";
import { DEBT_TYPES } from "@/constants/enums";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useCreateDebt, useUpdateDebt, useDeleteDebt } from "@/hooks/queries/use-debts";
import { useDebtsPaginated } from "@/hooks/queries/paginated/use-debts-paginated";
import { useDebtSummary } from "@/hooks/queries/use-debt-summary";
import { DebtModel } from "@/models/debts";
import { DebtTable } from "@/components/debt/DebtTable";
import { useTableState } from "@/hooks/use-table-state";
import { SelectFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import { useUserSettings } from "@/hooks/queries/use-user-settings";
import { DebtFormData, defaultDebtFormValues } from "@/form-dto/debts";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useDialogState } from "@/hooks/use-dialog-state";

const Debt = () => {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState<DebtModel | null>(null);

  const createDebt = useCreateDebt();
  const updateDebt = useUpdateDebt();
  const { mutate: deleteDebt } = useDeleteDebt();

  // Form state managed at page level
  const form = useForm<DebtFormData>({
    defaultValues: defaultDebtFormValues,
  });

  // Dialog state using reusable hook
  const dialog = useDialogState<DebtModel, DebtFormData>({
    form,
    defaultValues: defaultDebtFormValues,
    mapDataToForm: (debt) => ({
      name: debt.name || "",
      type: debt.type || DEBT_TYPES.LOAN,
      due_date: debt.due_date || "",
    }),
  });

  // Table state management using generic hook
  const { state: tableState, actions: tableActions } = useTableState({
    initialPage: 1,
    initialPageSize: 10,
  });

  const { data: paged, isLoading: isLoadingDebts } = useDebtsPaginated({
    page: tableState.page,
    itemsPerPage: tableState.pageSize,
    searchTerm: tableState.searchTerm,
    filters: tableState.filters
  });
  const debts = paged?.data || [];
  const totalCount = paged?.count || 0;

  const { data: debtSummary, isLoading: isLoadingDebtSummary } = useDebtSummary();
  const { data: userSettings, isLoading: isLoadingUserSettings } = useUserSettings();

  const isLoading = isLoadingDebts || isLoadingDebtSummary || isLoadingUserSettings;

  const debtGroupedById = debts.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<number, DebtModel>);

  // Mutation callbacks
  const { handleSuccess, handleError } = useMutationCallbacks({
    setIsLoading: dialog.setIsLoading,
    onOpenChange: (open) => !open && dialog.close(),
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.DEBTS
  });

  const handleFormSubmit = (data: DebtFormData) => {
    dialog.setIsLoading(true);
    if (dialog.selectedData) {
      updateDebt.mutate({ id: dialog.selectedData.id, ...data }, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    } else {
      createDebt.mutate(data, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    }
  };

  const handleDeleteClick = (debtId: number) => {
    const debt = debtGroupedById[debtId];
    if (debt) {
      setDebtToDelete(debt);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (debtToDelete) {
      deleteDebt(debtToDelete.id);
    }
  };

  const handleViewHistory = (debt: DebtModel) => {
    navigate(`/debt/${debt.id}`);
  };

  // Select filters configuration
  const selectFilters: SelectFilterConfig[] = [
    {
      key: "type",
      label: "Tipe",
      placeholder: "Semua Tipe",
      options: [
        { label: "Hutang", value: DEBT_TYPES.LOAN },
        { label: "Piutang", value: DEBT_TYPES.BORROWED }
      ]
    },
    {
      key: "status",
      label: "Status",
      placeholder: "Semua Status",
      options: [
        { label: "Aktif", value: "active" },
        { label: "Lunas", value: "paid_off" }
      ]
    },
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Hutang/Piutang</h1>
              <p className="text-sm text-muted-foreground mt-1">Kelola hutang dan piutang Anda</p>
            </div>
            <Button onClick={dialog.openAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Hutang/Piutang
            </Button>
          </div>

          {/* Debt Table */}
          <DebtTable
            debts={debts}
            isLoading={isLoading}
            totalCount={totalCount}
            page={tableState.page}
            pageSize={tableState.pageSize}
            searchTerm={tableState.searchTerm}
            filters={tableState.filters}
            onPageChange={tableActions.handlePageChange}
            onPageSizeChange={tableActions.handlePageSizeChange}
            onSearchChange={tableActions.handleSearchChange}
            onFiltersChange={tableActions.handleFiltersChange}
            onEdit={dialog.openEdit}
            onDelete={handleDeleteClick}
            onViewHistory={handleViewHistory}
            debtSummary={debtSummary}
            selectFilters={selectFilters}
            userSettings={userSettings}
          />
        </div>

        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          title="Hapus Hutang/Piutang"
          description="Apakah Anda yakin ingin menghapus hutang/piutang ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Ya, Hapus"
          cancelText="Batal"
          variant="destructive"
        />

        <DebtDialog
          open={dialog.open}
          onOpenChange={(open) => !open && dialog.close()}
          form={form}
          isLoading={dialog.isLoading}
          onSubmit={handleFormSubmit}
          debt={dialog.selectedData}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default Debt;
