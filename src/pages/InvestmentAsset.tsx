import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import InvestmentAssetDialog from "@/components/investment/InvestmentAssetDialog";
import { DeleteConfirmationModal, useDeleteConfirmation } from "@/components/DeleteConfirmationModal";
import { InvestmentAssetModel } from "@/models/investment-assets";
import { useInvestmentInstruments } from "@/hooks/queries/use-investment-instruments";
import { useCreateInvestmentAsset, useUpdateInvestmentAsset, useDeleteInvestmentAsset } from "@/hooks/queries/use-investment-assets";
import { useInvestmentAssetsPaginated } from "@/hooks/queries/paginated/use-investment-assets-paginated";
import { useAssetSummaries } from "@/hooks/queries/use-asset-summaries";
import { useTableState } from "@/hooks/use-table-state";
import { AssetSummaryData } from "@/models/money-summary";
import { InvestmentAssetTable } from "@/components/investment/InvestmentAssetTable";
import { getInvestmentAssetColumns } from "@/components/investment/InvestmentAssetColumns";
import { AssetFormData, defaultAssetFormValues } from "@/form-dto/investment-assets";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useAuth } from "@/hooks/use-auth";
import { useDialogState } from "@/hooks/use-dialog-state";

const InvestmentAsset = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { mutate: deleteInvestmentAsset } = useDeleteInvestmentAsset();
  const createAsset = useCreateInvestmentAsset();
  const updateAsset = useUpdateInvestmentAsset();

  // Table state management using generic hook
  const { state: tableState, actions: tableActions } = useTableState({
    initialPage: 1,
    initialPageSize: 5,
  });

  const { data: paged, isLoading: isAssetsLoading } = useInvestmentAssetsPaginated({
    page: tableState.page,
    itemsPerPage: tableState.pageSize,
    searchTerm: tableState.searchTerm,
    filters: tableState.filters,
  });
  const assets = paged?.data || [];
  const totalCount = paged?.count || 0;
  const { data: instruments, isLoading: isInstrumentsLoading } = useInvestmentInstruments();
  const { data: assetSummaries, isLoading: isAssetSummariesLoading } = useAssetSummaries();

  const isLoading = isAssetsLoading || isInstrumentsLoading || isAssetSummariesLoading;

  const assetSummaryGrouped = assetSummaries?.reduce((acc, summary) => {
    acc[summary.assetId] = summary;
    return acc;
  }, {} as Record<number, AssetSummaryData>);

  // Form
  const form = useForm<AssetFormData>({
    defaultValues: defaultAssetFormValues,
  });

  // Dialog state using reusable hook
  const dialog = useDialogState<InvestmentAssetModel, AssetFormData>({
    form,
    defaultValues: defaultAssetFormValues,
    mapDataToForm: (asset) => ({
      name: asset.name || "",
      symbol: asset.symbol || "",
      instrument_id: asset.instrument_id || null,
    }),
  });

  // Delete confirmation hook
  const deleteConfirmation = useDeleteConfirmation<number>({
    title: "Hapus Aset Investasi",
    description: "Apakah Anda yakin ingin menghapus aset investasi ini? Tindakan ini tidak dapat dibatalkan.",
  });

  // Mutation callbacks
  const { handleSuccess, handleError } = useMutationCallbacks({
    setIsLoading: dialog.setIsLoading,
    onOpenChange: (open) => !open && dialog.close(),
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.INVESTMENT_ASSETS
  });

  const handleFormSubmit = (data: AssetFormData) => {
    if (!user) return;
    dialog.setIsLoading(true);

    if (dialog.selectedData) {
      updateAsset.mutate({ id: dialog.selectedData.id, ...data }, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    } else {
      createAsset.mutate(data, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    }
  };

  const handleViewHistory = (asset: InvestmentAssetModel) => {
    navigate(`/investment-asset/${asset.id}`);
  };

  // Generate columns using separated column definitions
  const columns = getInvestmentAssetColumns({
    assetSummaryGrouped,
    onEdit: dialog.openEdit,
    onDelete: deleteConfirmation.openModal,
    onViewHistory: handleViewHistory,
  });

  return (
    <ProtectedRoute>
      <Layout>
        <DeleteConfirmationModal
          deleteConfirmation={deleteConfirmation}
          onConfirm={(id) => deleteInvestmentAsset(id)}
        />

        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Aset Investasi</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Kelola aset investasi dalam instrumen Anda
              </p>
            </div>
            <Button onClick={dialog.openAdd} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Aset
            </Button>
          </div>

          {/* Investment Asset Table */}
          <InvestmentAssetTable
            columns={columns}
            data={assets}
            totalCount={totalCount}
            isLoading={isLoading}
            searchTerm={tableState.searchTerm}
            onSearchChange={tableActions.handleSearchChange}
            filters={tableState.filters}
            onFiltersChange={tableActions.handleFiltersChange}
            instruments={instruments || []}
            page={tableState.page}
            pageSize={tableState.pageSize}
            setPage={tableActions.handlePageChange}
            setPageSize={tableActions.handlePageSizeChange}
          />
        </div>

        <InvestmentAssetDialog
          open={dialog.open}
          onOpenChange={(open) => !open && dialog.close()}
          form={form}
          isLoading={dialog.isLoading}
          onSubmit={handleFormSubmit}
          asset={dialog.selectedData}
          instruments={instruments}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default InvestmentAsset;
