import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import InvestmentInstrumentDialog from "@/components/investment/InvestmentInstrumentDialog";
import Layout from "@/components/Layout";
import { DeleteConfirmationModal, useDeleteConfirmation } from "@/components/DeleteConfirmationModal";
import { useCreateInvestmentInstrument, useUpdateInvestmentInstrument, useDeleteInvestmentInstrument } from "@/hooks/queries/use-investment-instruments";
import { useInvestmentInstrumentsPaginated } from "@/hooks/queries/paginated/use-investment-instruments-paginated";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { InvestmentInstrumentTable } from "@/components/investment/InvestmentInstrumentTable";
import { InstrumentFormData, defaultInstrumentFormValues } from "@/form-dto/investment-instruments";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useAuth } from "@/hooks/use-auth";
import { useDialogState } from "@/hooks/use-dialog-state";
import { useTableState } from "@/hooks/use-table-state";

const InvestmentInstrument = () => {
  const { user } = useAuth();

  const { mutate: deleteInstrument } = useDeleteInvestmentInstrument();
  const createInstrument = useCreateInvestmentInstrument();
  const updateInstrument = useUpdateInvestmentInstrument();

  // Table state
  const { state, actions } = useTableState({ initialPageSize: 10 });

  // Paginated data
  const { data: paged, isLoading } = useInvestmentInstrumentsPaginated({
    page: state.page,
    itemsPerPage: state.pageSize,
    searchTerm: state.searchTerm,
    filters: state.filters,
  });
  const instruments = paged?.data || [];

  // Form
  const form = useForm<InstrumentFormData>({
    defaultValues: defaultInstrumentFormValues,
  });

  // Dialog state using reusable hook
  const dialog = useDialogState<InvestmentInstrumentModel, InstrumentFormData>({
    form,
    defaultValues: defaultInstrumentFormValues,
    mapDataToForm: (instrument) => ({
      name: instrument.name || "",
      unit_label: instrument.unit_label || "",
      is_trackable: instrument.is_trackable ?? false,
    }),
  });

  // Delete confirmation hook
  const deleteConfirmation = useDeleteConfirmation<number>({
    title: "Hapus Instrumen Investasi",
    description: "Apakah Anda yakin ingin menghapus instrumen investasi ini? Tindakan ini tidak dapat dibatalkan.",
  });

  // Mutation callbacks
  const { handleSuccess, handleError } = useMutationCallbacks({
    setIsLoading: dialog.setIsLoading,
    onOpenChange: (open) => !open && dialog.close(),
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.INVESTMENT_INSTRUMENTS
  });

  const handleFormSubmit = (data: InstrumentFormData) => {
    if (!user) return;
    dialog.setIsLoading(true);

    if (dialog.selectedData) {
      updateInstrument.mutate({ id: dialog.selectedData.id, ...data }, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    } else {
      createInstrument.mutate(data, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <DeleteConfirmationModal
          deleteConfirmation={deleteConfirmation}
          onConfirm={(id) => deleteInstrument(id)}
        />

        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Instrumen Investasi</h1>
              <p className="text-muted-foreground text-sm">Kelola jenis instrumen investasi Anda</p>
            </div>
            <Button onClick={dialog.openAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Instrumen
            </Button>
          </div>

          {/* Table */}
          <InvestmentInstrumentTable
            data={instruments}
            totalCount={paged?.count || 0}
            isLoading={isLoading}
            searchTerm={state.searchTerm}
            onSearchChange={actions.handleSearchChange}
            filters={state.filters}
            onFiltersChange={actions.handleFiltersChange}
            page={state.page}
            pageSize={state.pageSize}
            setPage={actions.handlePageChange}
            setPageSize={actions.handlePageSizeChange}
            onEdit={dialog.openEdit}
            onDelete={deleteConfirmation.openModal}
          />
        </div>

        <InvestmentInstrumentDialog
          open={dialog.open}
          onOpenChange={(open) => !open && dialog.close()}
          form={form}
          isLoading={dialog.isLoading}
          onSubmit={handleFormSubmit}
          instrument={dialog.selectedData}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default InvestmentInstrument;
