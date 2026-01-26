import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import InvestmentInstrumentDialog from "@/components/investment/InvestmentInstrumentDialog";
import Layout from "@/components/Layout";
import { DeleteConfirmationModal, useDeleteConfirmation } from "@/components/DeleteConfirmationModal";
import { useCreateInvestmentInstrument, useUpdateInvestmentInstrument, useDeleteInvestmentInstrument, useInvestmentInstruments } from "@/hooks/queries/use-investment-instruments";
import { useInstrumentSummary, InstrumentSummary } from "@/hooks/queries/use-instrument-summary";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { InstrumentSummaryTable } from "@/components/investment/InstrumentSummaryTable";
import { InstrumentFormData, defaultInstrumentFormValues } from "@/form-dto/investment-instruments";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useAuth } from "@/hooks/use-auth";
import { useDialogState } from "@/hooks/use-dialog-state";
import { useTableState } from "@/hooks/use-table-state";
import { useMemo } from "react";

const InvestmentInstrument = () => {
  const { user } = useAuth();

  const { mutate: deleteInstrument } = useDeleteInvestmentInstrument();
  const createInstrument = useCreateInvestmentInstrument();
  const updateInstrument = useUpdateInvestmentInstrument();

  // Table state
  const { state, actions } = useTableState({ initialPageSize: 10 });

  // Fetch instrument summary data (with financial metrics)
  const { data: summaryData, isLoading: isSummaryLoading } = useInstrumentSummary();
  
  // Fetch raw instruments for edit dialog
  const { data: rawInstruments } = useInvestmentInstruments();

  // Filter and paginate client-side since we aggregate from investment_summary
  const filteredData = useMemo(() => {
    let result = summaryData || [];
    
    // Apply search filter
    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      result = result.filter(item => 
        item.instrumentName.toLowerCase().includes(term)
      );
    }
    
    // Apply is_trackable filter
    if (state.filters.is_trackable !== undefined && state.filters.is_trackable !== "") {
      const isTrackable = state.filters.is_trackable === "true";
      result = result.filter(item => item.isTrackable === isTrackable);
    }
    
    return result;
  }, [summaryData, state.searchTerm, state.filters]);

  // Paginate
  const paginatedData = useMemo(() => {
    const start = (state.page - 1) * state.pageSize;
    return filteredData.slice(start, start + state.pageSize);
  }, [filteredData, state.page, state.pageSize]);

  // Form
  const form = useForm<InstrumentFormData>({
    defaultValues: defaultInstrumentFormValues,
  });

  // Dialog state using reusable hook - maps InstrumentSummary to form
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
    queryKeysToInvalidate: [...QUERY_KEY_SETS.INVESTMENT_INSTRUMENTS, "instrument_summary"]
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

  // Handle edit from summary - find raw instrument data
  const handleEdit = (summary: InstrumentSummary) => {
    const rawInstrument = rawInstruments?.find(i => i.id === summary.instrumentId);
    if (rawInstrument) {
      dialog.openEdit(rawInstrument);
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
              <p className="text-muted-foreground text-sm">Kelola dan pantau performa instrumen investasi Anda</p>
            </div>
            <Button onClick={dialog.openAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Instrumen
            </Button>
          </div>

          {/* Table with financial metrics */}
          <InstrumentSummaryTable
            data={paginatedData}
            totalCount={filteredData.length}
            isLoading={isSummaryLoading}
            searchTerm={state.searchTerm}
            onSearchChange={actions.handleSearchChange}
            filters={state.filters}
            onFiltersChange={actions.handleFiltersChange}
            page={state.page}
            pageSize={state.pageSize}
            setPage={actions.handlePageChange}
            setPageSize={actions.handlePageSizeChange}
            onEdit={handleEdit}
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
