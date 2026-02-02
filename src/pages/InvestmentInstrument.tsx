import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import InvestmentInstrumentDialog from "@/components/investment/InvestmentInstrumentDialog";
import Layout from "@/components/Layout";
import { DeleteConfirmationModal, useDeleteConfirmation } from "@/components/DeleteConfirmationModal";
import { useCreateInvestmentInstrument, useUpdateInvestmentInstrument, useDeleteInvestmentInstrument } from "@/hooks/queries/use-investment-instruments";
import { useInstrumentSummary, InstrumentSummary } from "@/hooks/queries/use-instrument-summary";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { InstrumentSummaryTable } from "@/components/investment/InstrumentSummaryTable";
import { InstrumentFormData, defaultInstrumentFormValues } from "@/form-dto/investment-instruments";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useAuth } from "@/hooks/use-auth";
import { useDialogState } from "@/hooks/use-dialog-state";
import { useTableState } from "@/hooks/use-table-state";
import { useMemo } from "react";
import { useInvestmentInstrumentsPaginated } from "@/hooks/queries/paginated/use-investment-instruments-paginated";

const InvestmentInstrument = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { mutate: deleteInstrument } = useDeleteInvestmentInstrument();
  const createInstrument = useCreateInvestmentInstrument();
  const updateInstrument = useUpdateInvestmentInstrument();

  // Table state
  const { state: tableState, actions: tableActions } = useTableState({ initialPageSize: 10 });

  // Fetch instrument summary data (with financial metrics)
  const { data: summaryData, isLoading: isSummaryLoading } = useInstrumentSummary();

  // Fetch raw instruments for edit dialog
  const { data: paged, isLoading: isInstrumentsLoading } = useInvestmentInstrumentsPaginated({
    page: tableState.page,
    itemsPerPage: tableState.pageSize,
    searchTerm: tableState.searchTerm,
    filters: tableState.filters,
  });

  const isLoading = isSummaryLoading || isInstrumentsLoading;

  const rawInstruments = paged?.data as InvestmentInstrumentModel[];
  const totalCount = paged?.count || 0;

  const mapSummary = useMemo(() => {
    return summaryData?.reduce((acc, summary) => {
      acc[summary.instrumentId] = summary;
      return acc;
    }, {} as Record<number, InstrumentSummary>) || {};
  }, [summaryData])

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
    queryKeysToInvalidate: [...QUERY_KEY_SETS.INVESTMENT_INSTRUMENTS]
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

  // Handle edit from raw instrument data
  const handleEdit = (instrument: InvestmentInstrumentModel) => {
    dialog.openEdit(instrument);
  };

  // Handle view detail
  const handleView = (instrument: InvestmentInstrumentModel) => {
    navigate(`/investment-instrument/${instrument.id}`);
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
            data={rawInstruments}
            mapSummary={mapSummary}
            totalCount={totalCount}
            isLoading={isLoading}
            searchTerm={tableState.searchTerm}
            onSearchChange={tableActions.handleSearchChange}
            filters={tableState.filters}
            onFiltersChange={tableActions.handleFiltersChange}
            page={tableState.page}
            pageSize={tableState.pageSize}
            setPage={tableActions.handlePageChange}
            setPageSize={tableActions.handlePageSizeChange}
            onEdit={handleEdit}
            onDelete={deleteConfirmation.openModal}
            onView={handleView}
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
