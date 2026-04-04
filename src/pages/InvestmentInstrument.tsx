import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, TrendingUp, PiggyBank, BarChart3, Layers } from "lucide-react";
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
import { AmountText } from "@/components/ui/amount-text";
import { formatAmountCurrency } from "@/lib/currency";

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
  }, [summaryData]);

  const aggregateSummary = useMemo(() => {
    if (!summaryData || summaryData.length === 0) return null;
    const baseCurrency = summaryData[0]?.baseCurrencyCode || "IDR";
    return {
      baseCurrency,
      totalActiveCapital: summaryData.reduce((s, x) => s + (x.activeCapitalBaseCurrency || 0), 0),
      totalCurrentValue: summaryData.reduce((s, x) => s + (x.currentValueBaseCurrency || 0), 0),
      totalProfit: summaryData.reduce((s, x) => s + (x.totalProfitBaseCurrency || 0), 0),
    };
  }, [summaryData]);

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

        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Instrumen Investasi</h1>
                <p className="text-muted-foreground text-sm">Kelola dan pantau performa instrumen investasi Anda</p>
              </div>
            </div>
            <Button onClick={dialog.openAdd} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Instrumen
            </Button>
          </div>

          {/* Summary Stats */}
          {aggregateSummary && !isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="border-0 bg-muted/40">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
                    <Layers className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Instrumen</p>
                    <p className="text-lg font-bold truncate">{summaryData?.length || 0}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-muted/40">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10 shrink-0">
                    <PiggyBank className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Modal Aktif</p>
                    <p className="text-sm font-bold truncate">
                      {formatAmountCurrency(aggregateSummary.totalActiveCapital, aggregateSummary.baseCurrency, aggregateSummary.baseCurrency)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-muted/40">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <BarChart3 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Nilai Saat Ini</p>
                    <p className="text-sm font-bold truncate">
                      {formatAmountCurrency(aggregateSummary.totalCurrentValue, aggregateSummary.baseCurrency, aggregateSummary.baseCurrency)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-muted/40">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${aggregateSummary.totalProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <TrendingUp className={`w-4 h-4 ${aggregateSummary.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Total Profit</p>
                    <AmountText amount={aggregateSummary.totalProfit} showSign className="text-sm font-bold truncate block">
                      {formatAmountCurrency(Math.abs(aggregateSummary.totalProfit), aggregateSummary.baseCurrency, aggregateSummary.baseCurrency)}
                    </AmountText>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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
